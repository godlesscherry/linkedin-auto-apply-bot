require("dotenv").config();
const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

// URLs for job alerts
const JOB_ALERTS_URLS = [
  "https://www.linkedin.com/jobs/search/?f_AL=true&geoId=102713980&keywords=fullstack&location=India&f_TPR=r86400",
  "https://www.linkedin.com/jobs/search/?f_AL=true&geoId=102713980&keywords=senior%20software%20engineer&location=Hyderabad%2C%20Telangana%2C%20India&distance=25",
  "https://www.linkedin.com/jobs/search/?f_AL=true&geoId=102713980&keywords=technical%20lead&location=Hyderabad%2C%20Telangana%2C%20India&distance=25",
];

// Logging applications
const logApplication = (jobUrl) => {
  const logFile = "job_logs.json";
  let logs = {};

  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile));
  }

  if (!logs[jobUrl]) {
    logs[jobUrl] = "Applied";
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }
};

// Apply to a single job
const applyToJob = async (driver, jobUrl) => {
  try {
    console.log(`Processing job alert URL: ${jobUrl}`);
    await driver.get(jobUrl);

    // Wait for job listings to load
    await driver.wait(until.elementLocated(By.css(".jobs-search-results__list-item")), 30000);

    // Locate and click the first job listing
    const jobListing = await driver.findElement(By.css(".jobs-search-results__list-item a"));
    const jobUrlDetails = await jobListing.getAttribute("href");
    await driver.get(jobUrlDetails);

    // Wait for job details to load
    await driver.wait(until.elementLocated(By.css(".jobs-apply-button--top-card")), 30000);

    // Locate and click the "Easy Apply" button
    const easyApplyButton = await driver.wait(
      until.elementLocated(By.css(".jobs-apply-button--top-card")),
      10000
    );
    await driver.wait(until.elementIsVisible(easyApplyButton), 10000);
    await easyApplyButton.click();

    // Add your job application logic here (e.g., filling out forms, submitting application)
    console.log(`Easy Apply clicked for: ${jobUrlDetails}`);

    // Log the application
    logApplication(jobUrlDetails);
  } catch (error) {
    console.error(`Error applying to job: ${jobUrl}`, error);
  }
};

const main = async () => {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // Login to LinkedIn
    await driver.get("https://www.linkedin.com/login");
    await driver.findElement(By.id("username")).sendKeys(USER_EMAIL);
    await driver.findElement(By.id("password")).sendKeys(USER_PASSWORD);
    await driver.findElement(By.xpath("//button[@type='submit']")).click();

    // Wait for login to complete
    await driver.wait(until.urlContains("feed"), 30000);

    console.log("Logged in successfully!");

    // Process job alerts
    for (const url of JOB_ALERTS_URLS) {
      await applyToJob(driver, url);
    }
  } catch (error) {
    console.error("Error during the script execution:", error);
  } finally {
    await driver.quit();
  }
};

main();