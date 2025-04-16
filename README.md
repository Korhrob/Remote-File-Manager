## Simple Remote File Manger
A simple web application to manage remote files and edit manifest file for Eluair Patcher.
Handles basic login auth, file upload, file rename, file delete, file tracking for the manifest file and manual editing the manifest file.

## Installation
Ensure nodejs, npm and git are installed.
```bash
node -v
npm -v
git --version
```

Clone the repository
```bash
git clone git@github.com:Korhrob/Remote-File-Manager.git
```

Create your .env file inside the repository root, also create a 'patch' folder to NEXT_PUBLIC_ROOT location. Example:
```.env
NEXTAUTH_SECRET=[Secret Key]
NEXTAUTH_URL=http://localhost:3000

NOTE; for demo purposes we are exposing the public API key
NEXT_PUBLIC_API_KEY=[Secret Api Key] 

DUMMY_USER_USERNAME=admin
DUMMY_USER_PASSWORD=password
NEXT_PUBLIC_ROOT=/var/www/html
NEXT_PUBLIC_MANIFEST=manifest.txt
NEXT_SERVER_PATH=[Local rAthena Repositiory]
NEXT_PUBLIC_MAXFILESIZE=100
```

Install depencencies and run the project in dev mode (or build for production)
```bash
npm install
# or
yarn install

npm run dev
# or
yarn dev
```

## Usage
Open the app by entering your hostname/address into your web browser of choice.
Quickly and easily way to upload and manage files for your Eluair Patcher.
For technicalities on how the Eluair Patcher works, check out their documentation here http://elurair.com/

## Preview
![Screenshot](./public/screenshot.png)
