# Fitness E-Commerce Platform

A full-featured e-commerce web application connecting fitness enthusiasts with vendors offering gym apparel, supplements, and equipment.  
Developed as part of **CP317 – Software Engineering** (Group 13).

---

## Project Overview

The Fitness E-Commerce Platform enables:
- Customers to browse, filter, and purchase fitness products.
- Vendors to list products, manage inventory, and track sales.
- Administrators to approve vendors, moderate reviews, and oversee the marketplace.

This project is being developed incrementally following **Scrum** principles, with deliverables submitted at the end of each sprint.

---

## Sprint 1 Goal

**Deliver a functional login and registration system connected to a database, along with a mock product browsing interface to demonstrate user navigation and authentication flow.**

These foundational features support all future sprints and ensure a working prototype early in development.

---

## Project Structure
```text
fitness_ecommerce/
│
├── backend/                                # Flask REST API
│   ├── app.py                              # Flask app entry point (register blueprints, CORS)
│   ├── models.py                           # SQLAlchemy models (Users, Products)
│   ├── routes/
│   │   ├── auth.py                         # Auth routes (register/login)
│   │   ├── products.py                     # Product routes (list, details)
│   └── db/
│       └── schema.sql                      # Database schema and seed data
│
├── frontend_react/                         # React frontend
│   ├── public/
│   │   ├── index.html                      # Root HTML template (served by React)
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js                    # Centralized API calls (fetch, axios)
│   │   │
│   │   ├── components/                     # Reusable UI elements (buttons, cards, navbars)
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/                          # Top-level screens
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── App.jsx                         # Main routing and layout component
│   │   ├── main.jsx                        # Entry point (React 18 createRoot)
│   │   ├── styles/
│   │   │   └── global.css                  # App-wide styling
│   │   └── utils/
│   │       └── auth.js                     # Token helpers, protected route logic
│   │
│   ├── .env                                # Environment vars (API URL, etc.)
│   ├── package.json                        # React dependencies and scripts
│   ├── vite.config.js / webpack.config.js   # Build config (Vite recommended)
│   └── README.md
│
├── tests/
│   ├── test_auth.py                        # Backend unit tests
│   └── test_products.py                    # Example API test
│
├── .gitignore
├── README.md
└── requirements.txt
```