const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

const URL_REGEXP = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/(pull|tree)\/([^ ]+)$/;

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput("who-to-greet");
  console.log(`Hello ${nameToGreet}!`);
  const time = new Date().toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
const token = process.env.GITHUB_TOKEN;

console.log("URL: ", process.env.URL);

async function main() {
  const octokit = new Octokit({
    auth: `token ${token}`,
    userAgent: "kirisanth/trigger-pr-workflow",
  });

  await getPRs(octokit, process.env.URL);
}

async function getPRs(octokit, url) {
  const m = url.match(URL_REGEXP);
  const data = await octokit.pulls.list({
    owner: m[1],
    repo: m[2],
    state: "open",
  });

  console.log(data);
}

main().catch((e) => {
  process.exitCode = 1;
  console.error(e);
});