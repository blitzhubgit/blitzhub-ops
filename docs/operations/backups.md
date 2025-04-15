# Backups Description

## Description
Backup routines for the database (daily, 7-day retention) and storage (weekly, 30-day retention), with commands and validations.

## How to Develop
- **Audience**: Operations team.
- **Tone**: Practical and concise.
- **Format**: Markdown with steps and examples.

## Steps to Build
- Introduce backups: "Backups ensure data recovery."
- Detail database backup: E.g., "Daily, Autonomous DB, 7-day retention."
- Describe storage backup: E.g., "Weekly, `AssetsBlitzHubEU` buckets, 30 days."
- Include commands: E.g., "`oci os object bulk-download -bn AssetsBlitzHubEU`."
- Add validations: E.g., "Verify size with `oci os bucket get`."
