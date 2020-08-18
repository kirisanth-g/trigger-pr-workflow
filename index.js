const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput("who-to-greet");
//   console.log(`Hello ${nameToGreet}!`);
//   const time = new Date().toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2);
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const label = core.getInput("label");

  const octokit = new Octokit({
    auth: `token ${token}`,
    userAgent: "kirisanth/trigger-pr-workflow",
  });

  let prs = await getPRs(octokit, "payload.head_commit.URL");
  if (label) {
    prs = filterPRByLabel(prs, label);
  }

  console.log(prs);
}

async function getPRs(octokit, url) {
  const { owner, repo } = github.context.repo;
  const state = core.getInput("state");
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state,
  });

  return data;
}

function filterPRByLabel(prs, input_label) {
  return prs.filter(function (pr) {
    return pr.label.some(function (label) {
      label.name == input_label;
    });
  });
}

main().catch((e) => {
  process.exitCode = 1;
  console.error(e);
});
