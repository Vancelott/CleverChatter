## CleverChatter - AI GitHub Repository Crawler for Technical Interview Prep

![cleverchatter readme cover](https://github.com/Vancelott/CleverChatter/assets/129599049/c292d8e4-fdcb-4529-8b47-2632d6f5b4cb)

CleverChatter is an AI-powered GitHub repository crawler designed to assist users in preparing for technical interviews. Leveraging TypeScript, Next.js, Tailwind CSS, MongoDB, Prisma, NextAuth, Hugging Face.js, Octokit and Framer Motion, this project provides a unique approach to generating insightful questions based on the code of a selected GitHub project.

## Note:

CleverChatter is currently operating with limited functionality due to the unavailability of free AI models capable of generating both code and coding-related questions and being conversational at the same time. Once possible, the model will be switched out to one which meets the aforementioned requirements.

## Live Preview

You can check out the live demo of Cleverchatter at: https://cleverchatter.vercel.app/

## Features

- **Code Analysis for Interviews**: CleverChatter analyzes your GitHub repository's code and generates relevant technical questions to help you prepare for interviews.

- **TypeScript and Next.js**: Developed using TypeScript and Next.js for a robust and efficient codebase.

- **Tailwind CSS**: Utilizes Tailwind CSS for a clean and responsive user interface.

- **MongoDB and Prisma**: Stores and manages data efficiently with MongoDB as the database and Prisma as the ORM.

- **NextAuth for Authentication**: Implements NextAuth for a secure and seamless authentication process with Github.

- **Hugging Face.js for AI**: Leverages Hugging Face.js for AI-powered question generation based on the provided code.

- **Framer Motion for Animations**: Enhances user experience with smooth animations using Framer Motion.

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/cleverchatter.git
   ```

2. Navigate to the project directory:
   ```
   cd cleverchatter
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Configure MongoDB:
   - Create a MongoDB database and obtain the connection URI.
   - Update the connection URI in the `.env` file.

5. Configure NextAuth:

   - Create an OAuth application on your preferred social media platform (GitHub).
   - Update the NextAuth configuration in the nextauth.js file with your OAuth credentials.

6. Start the development server:
   ```
   npm run dev
   ```

7. Open the website in your browser:
   ```
   http://localhost:3000
   ```

## Screenshots

- **Homepage**

![cleverchatter-homepage](https://github.com/Vancelott/CleverChatter/assets/129599049/42bb1e54-ef93-406f-9dd2-bc3074435579)

- **Chat**

![cleverchatter-chat](https://github.com/Vancelott/CleverChatter/assets/129599049/70892055-f93a-493c-951b-caf6aff3c271)

## Upcoming Features

- Select a few random functions and generate questions for them.
- Create a roadmap-like future in which the user can see what areas need to be improved. 

## Contributing

Contributions to CleverChatter are welcome! If you encounter bugs, have feature suggestions, or want to make improvements, feel free to submit a pull request. Your contributions will help enhance the platform and make it better for everyone.
