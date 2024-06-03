import { danger, message, warn, fail } from "danger";
import { createLinter, loadTextlintrc } from "textlint";

async function main() {
  console.log("Danger started");

  // Load textlint configuration
  // https://textlint.github.io/docs/use-as-modules.html#apis
  const descriptor = await loadTextlintrc();
  const linter = createLinter({ descriptor });
  console.log("Textlint configuration loaded");

  // Get the list of changed files
  // https://danger.systems/js/reference.html#git
  const files = danger.git.modified_files.concat(danger.git.created_files);
  console.log("Files to lint: ", files);

  // Run textlint if file is a markdown or ARB file
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const arbFiles = files.filter((file) => file.endsWith(".arb"));

  // Lint the files
  [...markdownFiles, ...arbFiles].forEach((file) => {
    console.log("Linting file: ", file);
    linter.lintFiles([file]).then((results) => {
      console.log("Results: ", results);
      results.forEach((result) => {
        result.messages.forEach((m) => {
          switch (m.severity) {
            // TextlintRuleSeverityLevel.none || TextlintRuleSeverityLevel.info
            case 0:
              message(m.message, file, m.loc.start.line);
              break;
            // TextlintRuleSeverityLevel.warning
            case 1:
              warn(m.message, file, m.loc.start.line);
              break;
            // TextlintRuleSeverityLevel.error
            case 2:
              fail(m.message, file, m.loc.start.line);
              break;
          }
        });
      });
    });
  });
}

main();
