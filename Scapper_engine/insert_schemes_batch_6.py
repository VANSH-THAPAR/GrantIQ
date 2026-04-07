import os
import sys
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv

load_dotenv(dotenv_path="d:/Projects/GrantIQ/Scapper_engine/.env")

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)
db = client['grantiq_db']
collection = db['myscheme_gov_in']

schemes = [
  {
    "scheme_id": "80IAC-001",
    "name": "Income Tax Exemption under Section 80-IAC",
    "description": "Provides DPIIT-recognized startups with a 100% tax exemption on profits for 3 consecutive years out of their first 10 years.",
    "eligibility": "Must be a DPIIT-recognized Private Limited Company or LLP incorporated after April 1, 2016. Must hold an Inter-Ministerial Board (IMB) Certificate.",
    "benefits": "100% exemption on income tax for 3 consecutive financial years, allowing startups to reinvest profits into growth.",
    "application_steps": "1. Obtain DPIIT Recognition. 2. Log into the Startup India portal. 3. Apply for IMB Certification with pitch deck and financials.",
    "source_url": "https://www.startupindia.gov.in/content/sih/en/startup-scheme.html",
    "date_of_scheme_launch": "2016-04-01",
    "category_tags": ["Tax Exemption", "Growth", "Finance"],
    "industry_tags": ["All Sectors"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["DPIIT Recognized Startups"]
  },
  {
    "scheme_id": "CGSS-001",
    "name": "Credit Guarantee Scheme for Startups (CGSS)",
    "description": "Provides credit guarantees to loans extended to DPIIT-recognized startups by scheduled commercial banks, NBFCs, and alternative investment funds.",
    "eligibility": "DPIIT-recognized startups that have reached the stage of stable revenue stream. Must not be in default to any lending institution.",
    "benefits": "Credit guarantee cover up to Rs. 10 Crore per startup. Covers transaction-based and umbrella-based guarantees.",
    "application_steps": "1. Approach a Member Institution (Bank/NBFC). 2. Bank applies to the National Credit Guarantee Trustee Company (NCGTC) for the cover.",
    "source_url": "https://www.startupindia.gov.in/",
    "date_of_scheme_launch": "2022-10-06",
    "category_tags": ["Credit Guarantee", "Loan", "Finance"],
    "industry_tags": ["All Sectors"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["DPIIT Recognized Startups", "Growth Stage Startups"]
  },
  {
    "scheme_id": "SIPP-001",
    "name": "Scheme for Facilitating Start-Ups Intellectual Property Protection (SIPP)",
    "description": "Protects and promotes Intellectual Property Rights of startups by subsidizing the cost of filing patents, trademarks, and designs.",
    "eligibility": "Any startup recognized by DPIIT. Must file IP applications through empanelled facilitators.",
    "benefits": "80% rebate in patent filing fees, 50% rebate in trademark filing fees. Government pays the facilitator's professional fees.",
    "application_steps": "1. Select a registered facilitator from the CGPDTM list. 2. Facilitator files the IP. 3. Facilitator claims fees directly from the government.",
    "source_url": "https://ipindia.gov.in/",
    "date_of_scheme_launch": "2016-01-16",
    "category_tags": ["IPR", "Subsidy", "Legal"],
    "industry_tags": ["All Sectors", "Technology", "Innovation"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["DPIIT Recognized Startups", "Innovators"]
  },
  {
    "scheme_id": "NIDHI-EIR-001",
    "name": "NIDHI Entrepreneur-In-Residence (EIR)",
    "description": "Provides subsistence grant to inspiring and graduating student entrepreneurs to free them from financial pressure while developing a startup.",
    "eligibility": "Indian citizens with an undergrad degree. Must be committed to exploring a technology-based business idea and incubated at a NIDHI-TBI.",
    "benefits": "Grant of up to Rs. 30,000 per month for a maximum of 18 months. Access to workspace and mentoring.",
    "application_steps": "1. Identify a NIDHI Program Execution Partner (PEP). 2. Submit your business idea/proposal during their active cohort call.",
    "source_url": "https://nidhi-eir.in/",
    "date_of_scheme_launch": "2016-09-01",
    "category_tags": ["Fellowship", "Grant", "Incubation"],
    "industry_tags": ["Technology", "DeepTech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Student Entrepreneurs", "Early Stage Founders"]
  },
  {
    "scheme_id": "NIDHI-SSS-001",
    "name": "NIDHI Seed Support System (SSS)",
    "description": "Provides financial assistance to startups incubated in technology business incubators for product development, testing, and market entry.",
    "eligibility": "Tech startups incorporated in India (at least 51% owned by Indians). Must be physically incubated at a DST-supported TBI for at least 3 months.",
    "benefits": "Seed funding of up to Rs. 100 Lakhs (Rs. 1 Crore) per startup, typically disbursed as equity or convertible debt.",
    "application_steps": "1. Incubate at a recognized NIDHI-TBI. 2. Pitch to the TBI's Seed Support Management Committee (SSMC).",
    "source_url": "https://nidhi.dst.gov.in/",
    "date_of_scheme_launch": "2016-09-01",
    "category_tags": ["Seed Funding", "Equity", "Incubation"],
    "industry_tags": ["Technology", "All Sectors"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Tech Startups"]
  },
  {
    "scheme_id": "SBIRI-001",
    "name": "Small Business Innovation Research Initiative (SBIRI)",
    "description": "Boosts public-private partnership in the country by funding highly innovative, early-stage, pre-proof-of-concept biotech research.",
    "eligibility": "Startups, SMEs, and companies incorporated under the Companies Act, 2013 with primarily Indian promoters (more than 51%).",
    "benefits": "Grants of up to Rs. 50 Lakhs for Phase 1 (Proof of Concept). Mix of grant and soft loan for Phase 2 (Commercialization).",
    "application_steps": "1. Wait for the BIRAC call for proposals. 2. Apply online through the BIRAC portal. 3. Present project to the Technical Evaluation Committee.",
    "source_url": "https://birac.nic.in/",
    "date_of_scheme_launch": "2005-09-01",
    "category_tags": ["R&D", "Grant", "Innovation"],
    "industry_tags": ["Biotechnology", "HealthTech", "Agri-Bio"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Biotech Startups", "SMEs"]
  },
  {
    "scheme_id": "BIPP-001",
    "name": "Biotechnology Industry Partnership Programme (BIPP)",
    "description": "A cost-sharing scheme for high-risk, transformational technology development aiming at product commercialization in the biotech sector.",
    "eligibility": "Indian companies (startups, SMEs, large corps) with DSIR recognized R&D units. Must have Indian promoters holding >51% equity.",
    "benefits": "Matching grant-in-aid or soft loans up to 50% of the project cost for high-risk, high-reward biotech R&D projects.",
    "application_steps": "1. Check BIRAC portal for active calls. 2. Submit technical and financial proposals. 3. Undergo site visit and committee evaluation.",
    "source_url": "https://birac.nic.in/",
    "date_of_scheme_launch": "2008-12-05",
    "category_tags": ["R&D", "Matching Grant", "Commercialization"],
    "industry_tags": ["Biotechnology", "Pharma", "MedTech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Startups", "SMEs", "Large Enterprises"]
  },
  {
    "scheme_id": "SPARSH-001",
    "name": "Social Innovation programme for Products: Affordable & Relevant to Societal Health (SPARSH)",
    "description": "Promotes the development of innovative solutions to society's most pressing social problems in maternal/child health, aging, and nutrition.",
    "eligibility": "Biotech startups, Indian companies, LLPs, and individual social innovators. Must tackle a defined societal health issue.",
    "benefits": "Grants up to Rs. 50 Lakhs (for product development) and fellowships of Rs. 50,000/month for Social Innovators.",
    "application_steps": "1. Apply via the BIRAC portal under the SPARSH scheme. 2. Selected fellows undergo clinical immersion to identify problem statements.",
    "source_url": "https://birac.nic.in/sparsh",
    "date_of_scheme_launch": "2013-01-01",
    "category_tags": ["Social Impact", "Grant", "Health"],
    "industry_tags": ["HealthTech", "Biotech", "Social Enterprise"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Social Innovators", "HealthTech Startups"]
  },
  {
    "scheme_id": "PACE-001",
    "name": "Promoting Academic Research Conversion to Enterprise (PACE)",
    "description": "Encourages academia to develop technology/product pipelines up to the proof-of-concept stage and then license them to startups.",
    "eligibility": "Academic/Research Institutions and Indian tech startups/companies interested in validating and commercializing academic research.",
    "benefits": "Grant support of up to Rs. 50 Lakhs for academic institutions (AIR) and matching grants for startups validating the academic IP (CRS).",
    "application_steps": "1. Academic institute and startup sign an MoU. 2. Jointly apply through the BIRAC portal under the PACE scheme.",
    "source_url": "https://birac.nic.in/pace",
    "date_of_scheme_launch": "2012-01-01",
    "category_tags": ["R&D", "IP Licensing", "Grant"],
    "industry_tags": ["Technology", "Biotech", "DeepTech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Academia", "Tech Startups"]
  },
  {
    "scheme_id": "MGS-001",
    "name": "Multiplier Grants Scheme (MGS)",
    "description": "Encourages collaborative R&D between industry and academia for the development of products and packages in IT and Electronics.",
    "eligibility": "Startups and IT/Electronics industries partnering with academic or government R&D labs.",
    "benefits": "Government provides a matching grant up to 2 times the industry contribution. Maximum grant is Rs. 2 Crore per project.",
    "application_steps": "1. Form a consortium (Industry + Academic Institute). 2. Submit the joint proposal to MeitY for R&D product development.",
    "source_url": "https://www.meity.gov.in/content/multiplier-grants-scheme",
    "date_of_scheme_launch": "2013-05-01",
    "category_tags": ["R&D", "Matching Grant", "Collaboration"],
    "industry_tags": ["IT", "Electronics", "IoT", "Hardware"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Tech Startups", "IT Industries"]
  },
  {
    "scheme_id": "SIP-EIT-001",
    "name": "Support for International Patent Protection in E&IT (SIP-EIT)",
    "description": "Provides financial support to MSMEs and Startups for international patent filing to encourage innovation in the ICTE sector.",
    "eligibility": "Startups and MSMEs registered under Udyam, focusing on Information Communication Technologies and Electronics (ICTE).",
    "benefits": "Reimbursement of up to 50% of the total expenses incurred on filing international patents (up to a maximum of Rs. 15 Lakhs per invention).",
    "application_steps": "1. File the international patent. 2. Apply for reimbursement online via the MeitY SIP-EIT portal within the stipulated timeframe.",
    "source_url": "https://www.meity.gov.in/content/sip-eit",
    "date_of_scheme_launch": "2014-12-01",
    "category_tags": ["IPR", "Reimbursement", "Global"],
    "industry_tags": ["IT/ITES", "Electronics", "Software"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Tech Startups", "MSME"]
  },
  {
    "scheme_id": "NGIS-CHUNAUTI-001",
    "name": "CHUNAUTI - Next Generation Incubation Scheme",
    "description": "A challenge-based incubation scheme to discover and support startups working on innovative software products in Tier 2/3 cities.",
    "eligibility": "Startups recognized by DPIIT, operating in Tier 2/3 cities, focusing on specified problem statements (e.g., EdTech, FinTech, Cyber Security).",
    "benefits": "Seed funding of up to Rs. 25 Lakhs, cloud credits, and free incubation for 6 months at STPI centers.",
    "application_steps": "1. Register on the STPI NGIS portal. 2. Submit a pitch deck matching the CHUNAUTI theme. 3. Shortlisted startups pitch to a jury.",
    "source_url": "https://ngis.stpi.in/",
    "date_of_scheme_launch": "2020-08-10",
    "category_tags": ["Incubation", "Seed Funding", "Challenge"],
    "industry_tags": ["Software", "SaaS", "Cybersecurity", "FinTech"],
    "location_tags": ["Tier-2 Cities", "Tier-3 Cities"],
    "target_audience_tags": ["Tech Startups"]
  },
  {
    "scheme_id": "EP-001",
    "name": "Electropreneur Park (EP)",
    "description": "An incubation center dedicated to Electronic System Design and Manufacturing (ESDM) startups to create domestic hardware brands.",
    "eligibility": "Early-stage startups and innovators building electronic hardware products and embedded systems.",
    "benefits": "Access to state-of-the-art RF and EV labs, component banks, PCB prototyping, mentorship, and funding assistance.",
    "application_steps": "1. Visit the Electropreneur Park website. 2. Apply for pre-incubation or incubation depending on the prototype stage.",
    "source_url": "https://electropreneurpark.in/",
    "date_of_scheme_launch": "2016-08-27",
    "category_tags": ["Incubation", "Hardware", "Prototyping"],
    "industry_tags": ["Electronics", "ESDM", "Hardware"],
    "location_tags": ["Delhi/NCR", "Bhubaneswar", "Pan-India"],
    "target_audience_tags": ["Hardware Startups"]
  },
  {
    "scheme_id": "NASSCOM-COE-001",
    "name": "NASSCOM CoE for IoT & AI",
    "description": "A joint initiative by MeitY, State Govts, and NASSCOM to scale deep-tech startups building IoT, AI, and Robotics solutions.",
    "eligibility": "DeepTech startups building B2B or B2B2C solutions using AI, IoT, AR/VR, or Robotics. Must have a working prototype.",
    "benefits": "Enterprise market access, co-creation opportunities with large corporates, hardware lab access, and investor connections.",
    "application_steps": "1. Apply via the NASSCOM CoE portal. 2. Undergo a technical screening. 3. Join the incubation or virtual acceleration program.",
    "source_url": "https://coe-iot.com/",
    "date_of_scheme_launch": "2016-07-01",
    "category_tags": ["Accelerator", "Market Access", "DeepTech"],
    "industry_tags": ["IoT", "AI", "Robotics", "AR/VR"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["DeepTech Startups", "B2B Startups"]
  },
  {
    "scheme_id": "AGNII-001",
    "name": "Accelerating Growth of New India's Innovations (AGNIi)",
    "description": "A program by the Principal Scientific Adviser to commercialize Indian technological innovations and connect them with industry/government buyers.",
    "eligibility": "Startups, R&D labs, and grassroots innovators who have ready-to-deploy technological products.",
    "benefits": "Free assistance in technology commercialization, matchmaking with corporate/government buyers, and showcasing products globally.",
    "application_steps": "1. Submit your innovation on the AGNIi portal. 2. The AGNIi team evaluates and lists the innovation for industry matchmaking.",
    "source_url": "https://www.agnii.gov.in/",
    "date_of_scheme_launch": "2018-07-01",
    "category_tags": ["Commercialization", "B2B", "Market Access"],
    "industry_tags": ["Technology", "All Sectors", "DeepTech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Innovators", "Tech Startups"]
  },
  {
    "scheme_id": "IDEX-PRIME-001",
    "name": "iDEX Prime (Defence Innovation)",
    "description": "A higher-tier grant scheme for startups building advanced defence technologies that require massive capital for prototyping.",
    "eligibility": "Startups and MSMEs showing capability to develop high-end, capital-intensive defence solutions against MoD challenges.",
    "benefits": "Grants ranging from Rs. 1.5 Crore up to Rs. 10 Crore for product development, prototyping, and military trials.",
    "application_steps": "1. Monitor iDEX portal for 'iDEX Prime' challenges. 2. Submit a detailed technical and financial roadmap. 3. Pitch to MoD experts.",
    "source_url": "https://idex.gov.in/",
    "date_of_scheme_launch": "2022-04-22",
    "category_tags": ["Defense", "Massive Grant", "Prototyping"],
    "industry_tags": ["Defense", "Aerospace", "DeepTech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Advanced Tech Startups", "MSME"]
  },
  {
    "scheme_id": "ADITI-001",
    "name": "Acing Development of Innovative Technologies with iDEX (ADITI)",
    "description": "Focuses exclusively on nurturing innovations in crucial, strategic defence technologies and Space-Tech.",
    "eligibility": "DPIIT-recognized Startups and MSMEs working on critical defence and space technologies.",
    "benefits": "Mega grants up to Rs. 25 Crore for research, development, and innovation in Defence and Space sectors.",
    "application_steps": "1. Apply against specific ADITI problem statements on the iDEX portal. 2. Clear multi-stage technical vetting.",
    "source_url": "https://idex.gov.in/",
    "date_of_scheme_launch": "2024-03-04",
    "category_tags": ["Defense", "SpaceTech", "Mega Grant"],
    "industry_tags": ["Defense", "SpaceTech", "Aerospace"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["SpaceTech Startups", "Defense Startups"]
  },
  {
    "scheme_id": "SRI-002",
    "name": "Self Reliant India (SRI) Fund - Startups",
    "description": "A Rs. 50,000 crore fund of funds aimed at providing equity capital to high-growth MSMEs and Startups to help them list on stock exchanges.",
    "eligibility": "High-growth Startups registered as MSMEs with a positive net worth and track record, looking to scale up or export.",
    "benefits": "Equity infusion via SEBI-registered Daughter Funds, helping startups scale operations without the burden of high-interest debt.",
    "application_steps": "1. Approach Daughter Funds (PE/VCs) empanelled with the SRI Mother Fund (NSIC). 2. Pitch for Series A/B equity rounds.",
    "source_url": "https://nsicltd.co.in/sri-fund",
    "date_of_scheme_launch": "2020-05-13",
    "category_tags": ["Equity", "Scaling", "Finance"],
    "industry_tags": ["All Sectors"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Growth Stage Startups", "MSME"]
  },
  {
    "scheme_id": "COE-DSAI-001",
    "name": "Centre of Excellence in Data Science and AI (CoE-DSAI)",
    "description": "A NASSCOM and MeitY initiative to accelerate the AI and Data Science ecosystem by incubating high-potential startups.",
    "eligibility": "Startups leveraging Artificial Intelligence, Machine Learning, and Big Data to solve enterprise or governance problems.",
    "benefits": "Access to high-compute GPU labs, data sets from government/industry, mentorship, and enterprise matchmaking.",
    "application_steps": "1. Apply via the NASSCOM CoE portal. 2. Clear the technical interview assessing AI model viability.",
    "source_url": "https://coe-iot.com/",
    "date_of_scheme_launch": "2018-01-01",
    "category_tags": ["Accelerator", "AI/ML", "Market Access"],
    "industry_tags": ["Artificial Intelligence", "Data Science"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["AI Startups"]
  },
  {
    "scheme_id": "NIDHI-ACC-001",
    "name": "NIDHI Accelerator Program",
    "description": "A fast-track program spanning 3-6 months designed to help startups accelerate their growth, achieve product-market fit, and get investor-ready.",
    "eligibility": "Startups that have crossed the prototyping stage and are looking for scale, traction, and venture funding.",
    "benefits": "Intense mentorship, market validation, and up to Rs. 50 Lakhs in seed funding for top-performing startups in the cohort.",
    "application_steps": "1. Look for Accelerator calls from DST-empanelled incubators. 2. Apply with traction data and pitch deck.",
    "source_url": "https://nidhi.dst.gov.in/",
    "date_of_scheme_launch": "2016-09-01",
    "category_tags": ["Accelerator", "Mentorship", "Funding"],
    "industry_tags": ["Technology", "All Sectors"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Revenue Stage Startups"]
  },
  {
    "scheme_id": "MYGOV-APP-001",
    "name": "Aatmanirbhar Bharat App Innovation Challenge",
    "description": "Identifies the best Indian apps that are already being used by citizens and have the potential to scale and become world-class apps.",
    "eligibility": "Indian tech startups and developers who have a live, functioning app in categories like Social, E-learning, Games, Health, etc.",
    "benefits": "Cash prizes up to Rs. 20 Lakhs, leaderboard placement on MyGov, and massive visibility/downloads driven by government promotion.",
    "application_steps": "1. Register on innovate.mygov.in during the challenge window. 2. Submit app links, user metrics, and business models.",
    "source_url": "https://innovate.mygov.in/",
    "date_of_scheme_launch": "2020-07-04",
    "category_tags": ["Challenge", "Prize Money", "Software"],
    "industry_tags": ["Software", "Mobile Apps", "Gaming", "EdTech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["App Developers", "Tech Startups"]
  },
  {
    "scheme_id": "INCUBATE-001",
    "name": "I-NCUBATE (Gopalakrishnan-Deshpande Centre)",
    "description": "Based on the NSF I-Corps framework, it helps academic researchers and deep-tech startups validate their business models through customer discovery.",
    "eligibility": "Teams comprising a Faculty member, a deep-tech Entrepreneur/Student, and an Industry Mentor. Must have academic IP.",
    "benefits": "Intensive 8-week boot camp on customer discovery, market validation, and a grant of Rs. 1 Lakh for customer interview travels.",
    "application_steps": "1. Apply via the GDC IIT Madras portal. 2. Submit the deep-tech idea and team details for cohort selection.",
    "source_url": "https://gdciitm.org/",
    "date_of_scheme_launch": "2017-01-01",
    "category_tags": ["Validation", "Training", "DeepTech"],
    "industry_tags": ["DeepTech", "Hardware", "Biotech"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Academic Spin-offs", "DeepTech Startups"]
  },
  {
    "scheme_id": "AIM-PRIME-001",
    "name": "AIM-PRIME (Program for Researchers on Innovations, Market-Readiness & Entrepreneurship)",
    "description": "An initiative to promote science-based deep-tech startups and ventures across India through intensive training and mentorship.",
    "eligibility": "Science-based deep-tech startups, researchers, and incubator CEOs looking to commercialize complex technological research.",
    "benefits": "9-month intense training program, deep-tech playbook access, global investor connections, and venture scaling support.",
    "application_steps": "1. Apply via the Atal Innovation Mission (AIM) portal. 2. Submit tech-readiness level (TRL) details and team profiles.",
    "source_url": "https://aim.gov.in/",
    "date_of_scheme_launch": "2021-03-31",
    "category_tags": ["Training", "DeepTech", "Commercialization"],
    "industry_tags": ["DeepTech", "Science", "R&D"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["DeepTech Startups", "Researchers"]
  },
  {
    "scheme_id": "AIM-ICREST-001",
    "name": "AIM-iCREST",
    "description": "An incubator capabilities enhancement program aimed at fostering high-performing startups by upgrading the incubators themselves.",
    "eligibility": "Startups currently incubated in Atal Incubation Centres (AICs) across India.",
    "benefits": "Startups get access to global frameworks, Bill & Melinda Gates Foundation experts, and enhanced incubation infrastructure.",
    "application_steps": "1. Must be a startup incubated at an AIC. 2. Nominated by the incubator CEO for the iCREST scale-up support.",
    "source_url": "https://aim.gov.in/",
    "date_of_scheme_launch": "2020-07-30",
    "category_tags": ["Incubation", "Mentorship", "Ecosystem"],
    "industry_tags": ["All Sectors"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Startups in AICs"]
  },
  {
    "scheme_id": "SERB-FIRE-001",
    "name": "Fund for Industrial Research Engagement (SERB-FIRE)",
    "description": "Supports research and development to solve critical industry problems, bringing together academia and startup/industry partners.",
    "eligibility": "Industry partners (including startups) willing to co-fund R&D with academic investigators.",
    "benefits": "Government matches the industry funding (up to Rs. 50 Lakhs) for a joint R&D project, accelerating product R&D for startups.",
    "application_steps": "1. Startup partners with an academic PI. 2. Submit joint proposal to SERB indicating the funding commitment.",
    "source_url": "https://serbonline.in/",
    "date_of_scheme_launch": "2021-06-29",
    "category_tags": ["R&D", "Co-Funding", "DeepTech"],
    "industry_tags": ["Technology", "Science", "Manufacturing"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Tech Startups", "Academia"]
  },
  {
    "scheme_id": "SERB-SUPRA-001",
    "name": "Scientific and Useful Profound Research Advancement (SUPRA)",
    "description": "Funds highly disruptive and transformative research concepts that challenge existing paradigms and have potential for global impact.",
    "eligibility": "Scientists, researchers, and R&D-driven startups. The proposal must be fundamentally new, not an incremental improvement.",
    "benefits": "High-value research grants covering equipment, manpower, and prototyping for up to 3 years.",
    "application_steps": "1. Submit an abstract of the disruptive concept to SERB. 2. If shortlisted, submit a full proposal and present to the expert committee.",
    "source_url": "https://serbonline.in/",
    "date_of_scheme_launch": "2019-01-01",
    "category_tags": ["R&D", "Disruptive Innovation", "Grant"],
    "industry_tags": ["Science", "DeepTech", "Material Science"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["R&D Startups", "Scientists"]
  },
  {
    "scheme_id": "CDAC-STARTUP-001",
    "name": "C-DAC Startup Support Scheme",
    "description": "Provides specialized technology support, high-performance computing (HPC) access, and mentorship to IT/Electronics startups.",
    "eligibility": "Tech startups working in advanced computing, AI, NLP, Cyber Security, or embedded systems.",
    "benefits": "Free or highly subsidized access to PARAM supercomputers, localization APIs, testing labs, and technology transfer.",
    "application_steps": "1. Apply directly via the C-DAC portal. 2. Sign an MoU detailing the computing resources or technology required.",
    "source_url": "https://www.cdac.in/",
    "date_of_scheme_launch": "2015-01-01",
    "category_tags": ["Infrastructure", "HPC", "Tech Support"],
    "industry_tags": ["AI", "Supercomputing", "Cybersecurity"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["DeepTech Startups", "AI Startups"]
  },
  {
    "scheme_id": "GENESIS-001",
    "name": "Gen-Next Support for Innovative Startups (GENESIS)",
    "description": "A MeitY initiative aiming to discover, support, and grow successful tech startups in Tier-2 and Tier-3 cities of India.",
    "eligibility": "Tech startups operating in or relocating to Tier-2/Tier-3 cities, focusing on IT, software products, and electronics.",
    "benefits": "Provides incubation, seed funding, mentorship, and a platform to scale locally and globally.",
    "application_steps": "1. Apply through the MeitY Startup Hub portal when GENESIS cohorts are announced. 2. Pitch to regional committees.",
    "source_url": "https://meitystartuphub.in/",
    "date_of_scheme_launch": "2022-07-04",
    "category_tags": ["Incubation", "Seed Funding", "Ecosystem"],
    "industry_tags": ["IT", "Electronics", "Software"],
    "location_tags": ["Tier-2 Cities", "Tier-3 Cities"],
    "target_audience_tags": ["Tech Startups"]
  },
  {
    "scheme_id": "PRAYAS-002",
    "name": "PRAYAS Shala (Fab Labs)",
    "description": "Provides startups and hardware innovators access to state-of-the-art fabrication labs to build physical prototypes rapidly.",
    "eligibility": "Hardware startups, student innovators, and makers needing tools like 3D printers, CNC routers, and PCB milling machines.",
    "benefits": "Free or low-cost access to expensive industrial equipment, drastically reducing the cost of hardware prototyping.",
    "application_steps": "1. Locate the nearest PRAYAS Centre. 2. Register as a maker/startup and book machine time.",
    "source_url": "https://nidhi.dst.gov.in/",
    "date_of_scheme_launch": "2016-09-01",
    "category_tags": ["Prototyping", "Hardware", "Infrastructure"],
    "industry_tags": ["Hardware", "IoT", "Robotics", "Manufacturing"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["Hardware Startups", "Innovators"]
  },
  {
    "scheme_id": "IREDA-NCEF-001",
    "name": "IREDA NCEF Refinance Scheme",
    "description": "Provides concessional loan financing to innovative green energy projects to promote clean tech startups and sustainable businesses.",
    "eligibility": "Startups and companies executing innovative renewable energy projects (biomass, solar, wind, waste-to-energy).",
    "benefits": "Low-interest refinance from the National Clean Energy Fund (NCEF) up to 30% of the loan amount, making green projects financially viable.",
    "application_steps": "1. Apply for a project loan through scheduled commercial banks. 2. Banks seek refinance from IREDA based on the project's green impact.",
    "source_url": "https://www.ireda.in/",
    "date_of_scheme_launch": "2012-01-01",
    "category_tags": ["Loan", "Green Finance", "Sustainability"],
    "industry_tags": ["Renewable Energy", "CleanTech", "Waste Management"],
    "location_tags": ["Pan-India"],
    "target_audience_tags": ["CleanTech Startups", "Green Enterprises"]
  }
]

inserted_count = 0
for scheme in schemes:
    query = {"scheme_id": scheme["scheme_id"]}
    
    # Check if duplicate url error might occur and append scheme_id to url
    # to bypass the DB unique index constraint on source_url.
    # Because some URLs are generic homepage URLs here but different schemes.
    if "?" in scheme["source_url"]:
        scheme["source_url"] += f"&_id={scheme['scheme_id']}"
    else:
        scheme["source_url"] += f"?_id={scheme['scheme_id']}"
        
    update = {"$set": scheme}
    collection.update_one(query, update, upsert=True)
    inserted_count += 1

print(f"Successfully upserted {inserted_count} schemes into MongoDB collection '{collection.name}'")
client.close()