# CP317 – Fitness Marketplace

A full-stack fitness e-commerce platform built with **Flask (Python)** and **React (Vite)**.  
Developed collaboratively by **Group 13** as part of *CP317 – Software Engineering*.

This repository currently implements all foundational backend functionality (authentication, product endpoints, testing) and a working frontend prototype that connects to the live API.


---

## 🗂️ Project Structure
```text
CP317_Fitness_Marketplace/
│
├── backend/                              # Flask backend (Python)
│   ├── app.py                            # App factory, blueprint registration, CORS
│   ├── db_utils.py                       # Central DB helper (SQLite access)
│   ├── models.py                         # Reserved for ORM models (future sprint)
│   ├── routes/                           # Modular route blueprints
│   │   ├── auth.py                       # /api/register, /api/login
│   │   └── products.py                   # /api/products, /api/products/<id>
│   ├── db/
│   │   ├── schema.sql                    # Table definitions and seed data
│   │   └── fitness.db                    # SQLite database file
│   ├── tests/                            # Automated backend tests
│   │   ├── conftest.py                   # Flask test client fixture
│   │   ├── test_auth.py                  # Auth route tests
│   │   ├── test_products.py              # Product route tests
│   │   └── test_root.py                  # Sanity checks
│   ├── requirements.txt                  # Flask dependencies
│   └── __init__.py
│
├── frontend_react/                       # React frontend (Vite)
│   ├── public/                           # Root HTML & static assets
│   ├── src/
│   │   ├── api/index.js                  # API helper functions for backend calls
│   │   ├── App.jsx                       # Tabbed UI (Products, Register, Login)
│   │   ├── main.jsx                      # Entry point
│   │   ├── assets/                       # (Optional images, logos)
│   │   └── styles/                       # (CSS modules or global styles)
│   ├── .env                              # Backend URL (VITE_API_URL=http://127.0.0.1:5000/api)
│   ├── package.json                      # Frontend dependencies and scripts
│   ├── vite.config.js                    # Vite build configuration
│   └── node_modules/                     # Installed dependencies
│
├── pytest.ini                            # Pytest configuration (sets testpaths, PYTHONPATH)
├── LICENSE
└── README.md                             # Project documentation
```

---

## 🧠 How to Run the Project

### 1️⃣ Backend (Flask)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
python app.py
```

The backend runs at **http://127.0.0.1:5000/**  
Endpoints:
- `/api/health` – DB connectivity check  
- `/api/register` – User registration  
- `/api/login` – User login  
- `/api/products` – Product listing

---

### 2️⃣ Frontend (React + Vite)
```bash
cd frontend_react
npm install
npm run dev
```

Frontend runs at **http://localhost:5173/**  
Make sure Flask is running first — the React app reads from `VITE_API_URL` defined in `.env`.

---

## 🧪 Running Tests

### Run all backend tests
```bash
cd backend
pytest -v
```

Pytest suite covers:
- Registration & duplicate email handling  
- Login success/failure  
- Product retrieval & health check  
- Proper response codes for unimplemented endpoints

---

## 🤝 Contributing Guidelines

### 1. Branch Workflow
- Create a new branch for each feature, fix, or experiment:
  ```bash
  git checkout -b feature/<your-feature-name>
  ```
- When done, **open a Pull Request** and request review from teammates.


### 3. Testing
- Before merging, ensure **pytest passes**:
  ```bash
  cd backend
  pytest -q
  ```
- Add new tests for any new endpoints or major logic changes.

### 4. Frontend Collaboration
- Run `npm install` once when switching branches or after pulling changes.
- Store backend URL in `.env` (never hardcode API URLs in components).

---


## 🧾 Acknowledgments
Developed by **Group 13** – CP317, Fall 2025  
Wilfrid Laurier University
