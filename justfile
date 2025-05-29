setup:
  npm install
  just -l

dev:
  npm run dev

test:
  npm run checks
  npm run build

bump +type: test
  npm version "{{ type }}" --message "v%s" --force
