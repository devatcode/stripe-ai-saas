# Stripe AI SaaS Starter

This is a starter project combining:

- React frontend deployed on Netlify
- Flask backend deployed on Render
- Stripe payments integration
- Admin dashboard with user access control
- Admin logs viewer with filtering, pagination, sorting, and CSV export

## Setup

### Backend

1. Create and activate Python virtual environment
2. Install dependencies with `pip install -r requirements.txt`
3. Configure MongoDB and environment variables in `.env`
4. Run Flask app with `python server/app.py`

### Frontend

1. Install dependencies with `npm install` in `client` folder
2. Run React app with `npm start`

## Features

- Admin login with email-based access control
- Role-based permissions (owner, admin)
- View and revoke user access
- View admin activity logs with filters (admin, action, date range), sorting, pagination
- Export logs to CSV

## Deployment

- Frontend on Netlify
- Backend on Render

