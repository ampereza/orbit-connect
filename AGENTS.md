# Shell Command Safety Rules

- Use Bash-compatible commands for Debian Linux.
- Avoid deeply nested quoting and unnecessary bash -c.
- For multiline scripts, use quoted heredocs with a unique delimiter.
- For complex logic, create a temporary or project script file,
  then execute it separately.
- Never construct commands by concatenating untrusted strings.
- In Bash scripts, use arrays for commands with multiple arguments.
- Quote variable expansions: "$var" and "${array[@]}".
- Never use eval to work around quoting problems.
- Do not overwrite configuration files without inspecting them first.
- Validate generated scripts with bash -n before execution.
- For Node.js code, prefer project files over long node -e commands.
- Preserve existing project changes and avoid destructive commands.
