const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Wizard.jsx', 'utf-8');
const searchString = `      return {
        companyName: "",
        industry: "",
        entityType: "",
        foundedYear: "",
        stage: "",
        revenue: "",
        teamSize: "",
        socialCategory: "General",
        msmeStatus: "",
        dpiit: false,
        womenLed: false,
        firstGen: false,
        exServicemen: false,
        pwd: false,
        operationScope: "Regional",
        hqState: "",
        locationType: "Urban (Tier 1/2)",
        exportFocused: false,
        fundPurpose: [],
        challenge: ""
    };`;

const replaceString = `      return {
        companyName: "Digimantra",
        industry: "Software / IT Services",
        entityType: "Private Limited",
        foundedYear: "2019",
        stage: "Growth",
        revenue: "5 Crore to 50 Crore INR",
        teamSize: "21-50",
        socialCategory: "General",
        msmeStatus: "Udyam Registered",
        dpiit: true,
        womenLed: false,
        firstGen: true,
        exServicemen: false,
        pwd: false,
        operationScope: "National",
        hqState: "Maharashtra",
        locationType: "Urban (Tier 1/2)",
        exportFocused: false,
        fundPurpose: ["Product Development", "Marketing & Growth"],
        challenge: "Need funds to scale AI tools"
    };`;

fs.writeFileSync('frontend/src/pages/Wizard.jsx', code.replace(searchString, replaceString));
