# Full Project Build Guide

## 1. Project Overview

This document provides a complete step-by-step guide to build the AI Government Scheme Recommendation Platform.

The system helps businesses discover, understand, and apply for relevant government schemes using structured data and a recommendation engine.

---

## 2. Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Frontend

* React (Vite)
* Tailwind CSS

### Scraping

* Axios + Cheerio (basic)
* Puppeteer (if needed)

### Optional AI

* OpenAI API

---

## 3. Project Structure

### Backend

/backend
/models
/controllers
/routes
/services
/utils
server.js

### Frontend

/frontend
/src
/components
/pages
/services
/hooks

---

## 4. Database Design

### 4.1 User Schema

Fields:

* name
* email
* password
* industry
* stage
* revenue
* location

---

### 4.2 Scheme Schema

Fields:

* name
* description
* industry (array)
* stage (array)
* benefits
* deadline
* documents (array)
* link

---

## 5. Backend Development

### Step 1: Setup Server

* Initialize Node project
* Install dependencies:

  * express
  * mongoose
  * cors
  * dotenv

---

### Step 2: Connect Database

* Create MongoDB connection
* Use environment variables

---

### Step 3: Create Models

* User model
* Scheme model

---

### Step 4: Authentication APIs

Routes:

* POST /auth/signup
* POST /auth/login

---

### Step 5: User Profile API

* POST /user/profile
* GET /user/:id

---

### Step 6: Scheme APIs

* GET /schemes
* GET /schemes/:id

---

### Step 7: Recommendation Engine

Logic:

* Compare user and scheme
* Assign score based on:

  * industry
  * stage
  * location
  * revenue

Sort results and return top matches

---

### Step 8: Recommendation API

* GET /schemes/recommended/:userId

---

## 6. Data Scraping

### Step 1: Identify Websites

Select 2–3 government websites

### Step 2: Build Scraper

* Fetch HTML
* Parse using Cheerio
* Extract fields

### Step 3: Store Data

* Save into MongoDB

### Step 4: Automation

* Use cron jobs for updates

---

## 7. Frontend Development

### Step 1: Setup React

* Create project using Vite
* Install Tailwind CSS

---

### Step 2: Routing

Pages:

* Login
* Signup
* Onboarding
* Dashboard
* Recommendations
* Scheme Details

---

### Step 3: Authentication Flow

* Login / signup forms
* Store token (localStorage)

---

### Step 4: Onboarding Form

* Multi-step form
* Collect business data

---

### Step 5: Dashboard

* Show summary stats
* Show recent recommendations

---

### Step 6: Recommendations Page

* Fetch recommended schemes
* Display cards

---

### Step 7: Scheme Details Page

* Full scheme info
* Apply button

---

## 8. API Integration

Use axios:

* Fetch schemes
* Fetch recommendations
* Submit forms

---

## 9. AI Integration (Optional)

Features:

* Summarize schemes
* Explain benefits

Implementation:

* Send scheme text to OpenAI API
* Display response

---

## 10. Deployment

### Backend

* Render / Railway

### Frontend

* Vercel / Netlify

### Database

* MongoDB Atlas

---

## 11. Testing

* Test APIs using Postman
* Test UI manually

---

## 12. Final Checklist

* Backend working
* Database connected
* Scraper working
* Recommendation engine working
* Frontend connected
* Basic UI complete

---

## 13. Development Strategy

Follow this order:

1. Backend setup
2. Database models
3. Scraper
4. Recommendation engine
5. APIs
6. Frontend
7. AI (optional)

---

## 14. Key Principle

Focus on:

* Data quality
* Recommendation accuracy

Avoid:

* Overengineering
* Unnecessary tools

---

End of Document
