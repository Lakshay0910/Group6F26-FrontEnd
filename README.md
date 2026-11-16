# DriveWise – Smartphone-Based Driver Analytics System

**Group 6 | SENG71000 – Systems Analysis and Design | Fall 2026**

## Team Members
- Lakshay Bhatia
- Salman Imran
- Khushboo Nayyar

## Project Overview

DriveWise is a mobile application designed to encourage safer driving habits by monitoring driving behaviour using a smartphone instead of a separate vehicle tracking device.

The application allows drivers to record trips, review driving scores, and access their driving history. The project also includes a parent monitoring interface and plans for driving analytics, rewards, and potential insurance benefits based on safe driving performance.

## Technologies Used

- **React Native** – Cross-platform mobile application development
- **Expo** – Mobile development and testing
- **TypeScript** – Application programming and type safety
- **Node.js and Express.js** – Backend API development
- **Firebase Authentication** – User registration, login, and authentication
- **Supabase (PostgreSQL)** – Database for storing trip information
- **Git and GitHub** – Version control and collaboration
- **Azure DevOps** – Sprint planning and task management

## Features Implemented

### Mobile Application
- Driver and Parent role selection
- Driver dashboard
- Start Trip and End Trip functionality
- Trip duration timer
- Basic navigation between screens
- Prototype trip history and parent dashboard using sample data

### Authentication
- User registration using Firebase Authentication
- User login and authentication
- Authentication persistence after restarting the application
- Error handling for invalid login credentials

### Backend and Database
- Node.js and Express backend setup
- Supabase PostgreSQL database integration
- Firebase authentication verification for protected API requests
- Start Trip API endpoint to create trip records
- End Trip API endpoint to update trip records
- Storage of trip start time, end time, and trip status
- Prevention of multiple active trips
- SSL certificate configuration for secure database connections

## Features Currently Planned or in Development

### Driving Behaviour Tracking
- Real-time GPS location and speed tracking
- Motion sensor integration
- Acceleration and harsh braking detection
- Driving score calculation based on recorded driving behaviour
- Storage of calculated scores and trip statistics in Supabase

### Dashboard and Analytics
- Trip history using real database records
- Recent trip driving score
- Weekly and monthly average driving scores
- Driving analytics and trip summary screens
- Swipeable driving score dashboard

### Profile and Account Management
- Driver profile management
- Account settings
- Password management
- FAQs and support information

### Rewards and Insurance Benefits
- Demonstration store discounts based on driving scores
- Driving rewards eligibility
- Potential insurance benefits based on safe driving performance

*Rewards and insurance benefits are prototype features and do not represent actual offers from businesses or insurance providers.*

### Other Planned Features
- Parent-driver account linking
- Trip route visualization using maps
- End-to-end application testing and bug fixes

## How to Run the Application

### Prerequisites
- Node.js and npm
- Git
- Expo-compatible mobile device or simulator
- Access to the required Firebase and Supabase configuration

### Setup

1. Clone the GitHub repository.
2. Open the project folder.
3. Install dependencies:

   `npm install`

4. Configure the required environment variables for Firebase and backend services.
5. Start the React Native application:

   `npx expo start`

6. Open the application using a compatible development environment or simulator.

The Express backend must also be configured and started separately for database-connected functionality. Refer to the backend configuration and scripts in the repository.

**Security Note:** Database passwords, private API keys, and environment files containing secrets must not be committed to GitHub.

## Current Development Status

DriveWise has progressed beyond the initial Phase 2 prototype and is currently undergoing Sprint 3 development.

Firebase user authentication and persistence are working. The Express backend is connected to Supabase PostgreSQL, and authenticated Start Trip and End Trip operations can create and update trip records.

Some screens still use demonstration data, and driving scores and distance values are currently placeholders.

Real-time GPS tracking, motion sensor detection, driving score calculation, analytics integration, and rewards functionality are being developed.

The team is working toward integrating these features and completing end-to-end testing before the final project demonstration.
