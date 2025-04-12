# Food for All

## Overview
**Food for All** is an innovative platform designed to combat the global food crisis by connecting surplus food from donors, such as restaurants and grocery stores, with non-governmental organizations (NGOs) and individuals facing hunger. Leveraging Google technology, we utilize advanced algorithms and real-time data analysis to optimize food distribution, reduce waste, and ensure that food reaches those in need. With 1.3 billion tons of food wasted annually and 828 million people facing hunger daily, our mission is to create a sustainable food system that minimizes waste and promotes food security, fostering community engagement and collaboration in the fight against hunger.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [User  Interfaces](#user-interfaces)
- [Technical Architecture](#technical-architecture)
- [Future Impact & Vision](#future-impact--vision)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
### Key Features
- **Food Recognition**: An advanced quality detection system with **95% accuracy** that identifies spoilage and nutritional content using **Gemini AI** and **TensorFlow**.
- **Smart Matching**: Intelligent pairing of donors with NGOs based on location, needs, and capacity, optimizing distribution efficiency through machine learning algorithms and **Google Maps API**.
- **Real-time Tracking**: Live monitoring of food shipments to ensure timely delivery and minimize spoilage during transit, utilizing GPS integration for precise location tracking.
- **Reward System**: A gamified platform that incentivizes participation from donors and NGOs, enhancing engagement through **Firebase** for user authentication and real-time updates.

### Advanced AI Integration
- **Gemini AI**: Detects food quality with high accuracy, minimizing waste by identifying spoilage and ensuring only safe food is distributed.
- **Logistics Optimization**: Utilizes **Google Maps API** to optimize delivery routes, reducing transportation time and costs.

### Social Impact
- **Gamification**: Engages donors through rewards and recognition, incentivizing continued participation and increasing overall contributions.
- **Impact Dashboard**: Tracks the amount of food saved from landfills and highlights the positive impact of donations, reinforcing the value of contributions.

## Technologies Used
- **Frontend**: React.js for building the user interface.
- **Backend**: Node.js and Express for server-side logic.
- **Database**: MongoDB for storing user and food donation data.
- **Real-Time Communication**: Socket.io for real-time messaging and updates.
- **Cloud Services**: Firebase for user authentication and data storage.
- **Mapping Services**: Google Maps API for location-based functionalities.
- **AI Integration**: Gemini AI for food quality detection and analysis.

## Installation
To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Garimaraj15/food-for-all.git
   cd food-for-all
   ```

2. **Install dependencies**:
   - For the backend:
   ```bash
   cd server
   npm install
   ```

   - For the frontend:
   ```bash
   cd client
   npm install
   ```

## Usage
To run the application locally, follow these steps:

1. **Start the backend server**:
   ```bash
   cd server
   python server.py
   ```

2. **Start the frontend application**:
   ```bash
   npm start
   ```

3. **Access the application**:
   Open your web browser and navigate to `http://localhost:3000` to access the Food for All platform.

## How It Works
1. **User  Registration**: Users can sign up as donors or recipients.
2. **Food Donation**: Donors can upload details of available food items, including images and expiration dates.
3. **Smart Analysis**: The system uses AI to assess the quality of the food and ensure only viable donations proceed.
4. **Intelligent Matching**: The platform matches donations with local charities or individuals based on their needs and location.
5. **Optimized Delivery**: The system plans the quickest route for food delivery, coordinating pick-up and drop-off times.
6. **Real-Time Updates**: Users receive notifications about the status of their donations and contributions.

## User Interfaces
### Donor Interface
- **One-click Donation Upload**: Allows donors to quickly upload images and information about their food donations with minimal effort.
- **Real-time Food Status Tracking**: Provides donors with up-to-date information on the status of their donations, from upload to distribution.
- **Impact Dashboard**: Showcases the positive impact of the donor's contributions, including the amount of food saved and the number of people helped.

### NGO Dashboard
- **Donation Management Console**: Allows NGOs to easily view, accept, and manage incoming food donations.
- **Analytics Dashboard**: Provides insights into donation trends, food distribution patterns, and overall program effectiveness.
- **Automated Distribution**: Streamlines the process of allocating donations to those in need, reducing waste and ensuring timely delivery.

## Technical Architecture
The technical architecture of Food for All is designed for robustness, scalability, and maintainability. It comprises three primary components:
1. **Frontend**: User interfaces for donors and NGOs.
2. **Backend**: Server-side logic and database management.
3. **Real-Time Communication**: Socket.io for real-time updates and notifications.

This architecture ensures that the Food for All system is not only functional and efficient but also capable of scaling to meet increasing demand and evolving needs.

## Future Impact & Vision
We envision a world free of food waste, where technology efficiently connects surplus food with those in need, fostering sustainable and equitable food systems for everyone. Our future goals include:
- **Global Scale**: Expand Food for All to connect food banks and NGOs worldwide.
- **Retail Partnerships**: Collaborate with retailers to redistribute unsold food and incentivize participation through tax benefits and public recognition.
- **Transparent Tracking with Blockchain**: Implement blockchain for transparent tracking of donations, ensuring accountability and trust among stakeholders.
- **Sustainable & Equitable Food Systems**: Reduce food waste and promote equitable food access in vulnerable communities.

## Contributing
We welcome contributions from the community! If you would like to enhance the project or fix any bugs, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your forked repository.
5. Submit a pull request detailing your changes.

## Contact
For any questions, feedback, or inquiries, please contact the project maintainer:

- **Name**: Anushka Laheri & Garima Raj
- **Email**: anushkalaheri@gmail.com & garimaraj536@gmail.com
- **GitHub**: (https://github.com/Garimaraj15) & (https://github.com/AnushkaLaheri)

Thank you for your interest in Food for All! Together, we can make a difference in reducing food waste and combating hunger.
