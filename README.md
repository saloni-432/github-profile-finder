# github-profile-finder

A simple website which displays public GitHub repositories of any GitHub user. Uses plain HTML, CSS and JavaScript with Bootstrap for styling. Hence requires no special setup to run on local!

## Features

- Search parameters in the url, hence making the website extremely shareable. All searches can be shared via links!
- Hits GitHub REST API endpoints directly, bypassing the need to use GitHub secrets for authentication.
- Uses window caching, hence reloads do not trigger API requests!

## Run locally

1. Clone the repository
2. Do not open the HTML file directly in the browser. Run the module on a local web server (VS Code Live Server, Node Static Server, Node Live Server).

### Using VS Code

1. Install Live Server extension.
2. Run the Live Server while in the HTML's directory.
3. Website will open up on a new browser page
