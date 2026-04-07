# Complete Project Context

## 1. Project Vision

We are building a platform that helps businesses (startups/MSMEs) discover and utilize government schemes, grants, and policies efficiently.

The goal is to eliminate the gap between available opportunities and businesses that can benefit from them.

---

## 2. Core Problem

Businesses face the following challenges:

1. Information is scattered across multiple government websites
2. No centralized platform for discovery
3. Hard to identify relevant schemes
4. Complex and unclear eligibility criteria
5. Difficult application process

Result:

* Businesses miss financial opportunities
* Time is wasted searching and understanding schemes

---

## 3. Core Solution

We are building an AI-powered platform that:

1. Collects government schemes into a single system
2. Matches schemes with business profiles
3. Ranks schemes based on relevance
4. Guides businesses through the application process

---

## 4. Key Idea

The system is NOT just an AI tool.

It is:

> A data-driven recommendation engine with AI assistance

---

## 5. System Components

### 5.1 Data Collection

* Scrape government websites
* Extract scheme information

### 5.2 Data Structuring

* Convert raw data into structured format

### 5.3 Database

* Store schemes and user profiles

### 5.4 Business Input

* Users provide business details

### 5.5 Recommendation Engine

* Match schemes with users
* Assign relevance scores

### 5.6 Frontend

* Display recommendations
* Show scheme details

### 5.7 AI Layer (Optional)

* Explain schemes
* Simplify information

---

## 6. User Flow

1. User signs up
2. User fills business details
3. System analyzes profile
4. System fetches matching schemes
5. System ranks schemes
6. User views recommendations
7. User applies via provided guidance

---

## 7. Recommendation Logic

The system compares:

User Profile vs Scheme Data

Parameters:

* Industry
* Business stage
* Location
* Revenue

Output:

* Relevance score
* Ranked list of schemes

---

## 8. Tech Stack

Backend:

* Node.js
* Express.js

Database:

* MongoDB

Frontend:

* React
* Tailwind CSS

Scraping:

* Cheerio / Puppeteer

AI (optional):

* OpenAI API

---

## 9. MVP Scope

Focus on:

* 2–3 government websites
* Basic scraping
* Simple recommendation engine
* Minimal UI

Avoid:

* Complex infrastructure
* Advanced AI features initially

---

## 10. Key Challenges

1. Unstructured government data
2. Data consistency issues
3. Accurate recommendation logic
4. Avoiding overengineering

---

## 11. Success Criteria

The system is successful if:

* Users find relevant schemes quickly
* Recommendations are accurate
* Users understand schemes easily
* Users are able to apply successfully

---

## 12. Final Understanding

This project solves a real-world problem by:

* Centralizing information
* Personalizing discovery
* Simplifying decisions
* Enabling execution

It is fundamentally a:

> Data pipeline + recommendation system + user interface

---

End of Document
