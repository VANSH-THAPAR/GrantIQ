const mongoose = require('mongoose');
const { fillForm } = require('./controllers/formController');
const User = require('./models/User');
const Form = require('./models/Form');
const readline = require('readline');

// Promisified readline for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (query) => new Promise(resolve => rl.question(query, resolve));

// MongoDB config (mock connection for testing)
const MOCK_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/grantiq-test';

async function runTest() {
    console.log('--- STARTING AI FORM AUTOMATION TEST RUNNER ---');
    try {
        await mongoose.connect(MOCK_MONGO_URI);
        console.log('[TestRunner] Connected to MongoDB');

        const fs = require('fs');
        const path = require('path');
        const gaganData = JSON.parse(fs.readFileSync(path.join(__dirname, 'gagan.json'), 'utf8'));

        // Removing automatic password injection to allow users to manually enter passwords.

        // Create mock user
        const mockEmail = `gagan.garg.${Date.now()}@gmail.com`; // Enforcing @gmail.com
        const mockPhone = '9876543210'; // Enforcing strictly 10 digits

        const mockUser = new User({
            name: `${gaganData.firstName} ${gaganData.surname}`,
            email: mockEmail,
            // Provide a dummy password for the DB schema requirement,
            // but dataResolver will skip inserting it into the actual web forms.
            password: 'SkippedBrowserInjection@123',
            industry: 'IT',
            businessType: 'Private Limited',
            stage: 'Startup',
            revenue: 1000000,
            employeeCount: 50,
            yearOfEstablishment: 2020,
            state: gaganData.state,
            city: gaganData.city,
            founderCategory: 'Veteran',
            profile: {
                ...gaganData,
                emailId: mockEmail,
                mobileNo: mockPhone,
                gender: "Male",
                caste: "General"
            }
        });
        mockUser.fallback = {};
        await mockUser.save();
        console.log(`[TestRunner] Mock User created: ${mockUser._id}`);

        // Accept target identifier from command line
        const args = process.argv.slice(2);
        let targetUrls = [];

        if (args.includes('ksb')) {
            targetUrls.push('https://ksb.gov.in/registration.htm');
        } else if (args.includes('gujarat')) {
            targetUrls.push('https://esamajkalyan.gujarat.gov.in/Registration.aspx');
        } else if (args.includes('all')) {
            targetUrls = [
                'https://ksb.gov.in/registration.htm',
                'https://esamajkalyan.gujarat.gov.in/Registration.aspx'
            ];
        } else if (args.length > 0 && args[0].startsWith('http')) {
            targetUrls = args;
        } else {
            console.error('\n❌ ERROR: Please specify which form to run by passing a keyword!');
            console.error('Usage options:');
            console.error('  node testRunner.js ksb      -> Runs the KSB form');
            console.error('  node testRunner.js gujarat  -> Runs the Gujarat Samaj Kalyan form');
            console.error('  node testRunner.js all      -> Runs both sequentially');
            console.error('  node testRunner.js <URL>    -> Runs a custom URL\n');
            process.exit(1);
        }

        for (const url of targetUrls) {
            console.log(`\n======================================================`);
            console.log(`[TestRunner] Processing Form: ${url}`);
            console.log(`======================================================\n`);
            
            // Create mock form
            const mockForm = new Form({
                url: url,
                title: `Automated Test Form - ${new URL(url).hostname}`
            });
            await mockForm.save();
            console.log(`[TestRunner] Mock Form saved to DB: ${mockForm._id} for ${url}`);

            // Simulate Express request/response
            const req = {
                body: {
                    formId: mockForm._id.toString(),
                    userId: mockUser._id.toString()
                }
            };

            const res = {
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    console.log(`\n--- TEST RUNNER FINAL RESULT (Status ${this.statusCode}) for ${url} ---`);
                    console.dir(data, { depth: null, colors: true });
                    console.log('-----------------------------------------------------\n');
                    return data;
                }
            };

            // Invoke Controller flow
            await fillForm(req, res);
            
            console.log(`\n[TestRunner] Finished processing ${url}. Moving to next or waiting...\n`);
        } // End loop over targeted urls

    } catch (e) {
        console.error('[TestRunner] Fatal Error:', e);
    } finally {
        console.log('[TestRunner] Automated fields injected successfully.');
        console.log('[TestRunner] Browser will remain open for manual entry. Press Ctrl+C in terminal when done.');
        await new Promise(r => setTimeout(r, 1000000));
        await mongoose.connection.dropDatabase(); // Clean up DB
        await mongoose.disconnect();
    }
}

runTest();
