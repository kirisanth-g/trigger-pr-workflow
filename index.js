const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

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

  await disptachPREvents(octokit, prs);
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
    return pr.labels.some((label) => label.name == input_label);
  });
}

async function disptachPREvents(octokit, prs) {
  const { owner, repo } = github.context.repo;
  const workflow_id = core.getInput("workflow");

  prs.forEach((pr) => {
    console.log(`${pr.title}: Attempting to dispatch event to PR named`);
    octokit.actions
      .createWorkflowDispatch({
        owner,
        repo,
        workflow_id,
        ref: pr.head.ref,
      })
      .then(() => console.log(`${pr.title}: Finished`))
      .catch((e) => {
        console.error(`${pr.title} Errored: ${e}`);
      });
  });
}

main().catch((e) => {
  process.exitCode = 1;
  console.error(e);
});
