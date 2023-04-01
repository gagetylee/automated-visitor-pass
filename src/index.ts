// External libraries
import minimist from "minimist";
import { cleanEnv, str } from "envalid";
import dotenv from "dotenv";
import { Browser, Page, chromium, devices } from "playwright";

// Local imports
import { Credentials } from "./interfaces/credentials";
import { VisitorDetails } from "./interfaces/visitorDetails";

// Process arguments and environment variables
const argv = minimist(process.argv.slice(2));
dotenv.config();

const login = async (
  page: Page,
  { address, suite, password }: Credentials
): Promise<Page> => {
  await page
    .locator(
      '.MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input'
    )
    .fill(address);

  const popper = await page.waitForSelector(".MuiAutocomplete-option");
  await popper.click();
  await page.locator("[name=suite]").fill(suite);
  await page.getByText("Resident").click();
  await page.locator("[type=password]").fill(password);
  await page.getByRole("button", { name: /login/i }).click();
  return page;
};

const sendParkingPass = async (
  page: Page,
  { cellNum, licensePlate, name }: VisitorDetails
) => {
  await page
    .getByRole("button")
    .filter({ hasText: "Create / Send Visitor Passes" })
    .click();

  await page.locator("[name=phoneno]").fill(cellNum);
  await page.locator("[name=name]").fill(name);
  await page.getByRole("checkbox").check();
  await page
    .locator(
      '.MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input:first-child'
    )
    .fill(licensePlate);

  const button = page.getByRole("button", {
    name: "Create Visitor Parking Pass",
  });

  // await page.waitForTimeout(2000);
  await button.click();

  return page;
};

(async () => {
  // Parse arguments
  if (process.argv.length <= 2) {
    throw new Error("Phone number required");
  }

  // Parse environment variables
  const env = cleanEnv(process.env, {
    ADDRESS: str(),
    SUITE: str(),
    PASSWORD: str(),
  });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://www.pass10x.com");

  // Login
  await login(page, {
    address: env.ADDRESS,
    suite: env.SUITE,
    password: env.PASSWORD,
  });

  await sendParkingPass(page, {
    cellNum: argv.phone.toString(),
    name: argv.name,
    licensePlate: argv.plate,
  });

  await page.waitForURL("https://www.pass10x.com/confirmtextmsg");
  await page.close();
  await context.close();
  await browser.close();
})();
