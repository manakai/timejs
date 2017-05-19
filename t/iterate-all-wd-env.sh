#! /bin/bash

all_passed=1

for wd_ua in "firefox" "chromium"; do
  for wd_locale in "en-US" "ja-JP"; do
    for wd_tz in "UTC" "America/Los_Angeles" "Asia/Tokyo"; do
      WD_UA=$wd_ua WD_LOCALE=$wd_locale WD_TZ=$wd_tz $@
      status=$?
      if [ $status != 0 ]; then all_passed=0; fi
    done
  done
done

if [ $all_passed = 1 ]; then
  exit 0
else
  exit 1
fi
