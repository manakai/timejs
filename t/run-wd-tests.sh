#! /bin/bash

PROJECT_DIR_ABS=${PROJECT_DIR_ABS:-"$(cd "$(dirname "${BASH_SOURCE:-$0}")/.."; pwd)"}
PERL=${PERL:-"$PROJECT_DIR_ABS/perl"}
DOCKER=${DOCKER:-"docker"}

mount_spec="${DOCKER_MOUNT_DIR:-$PROJECT_DIR_ABS}:/project"

case $WD_UA in
  "firefox")  name_ua="firefox"  ; image_name="quay.io/wakaba/firefoxdriver:stable"  ; wd_port=9516 ;;
  "chromium") name_ua="chromium" ; image_name="quay.io/wakaba/chromedriver:chromium" ; wd_port=9515 ;;
  *) echo "Unknown \$WD_UA: $WD_UA"; exit 1 ;;
esac

# Notes
# * On Firefox,
#   * `Date.prototype.toLocaleString` method depends on locale of OS, and
#   * `navigator.language` depends on `intl.accept_languages` of prefs.
case $WD_LOCALE in
  "en-US") name_locale="en" ; wd_lang_env="en_US.utf-8" ; test_lang="en-US" ;
    test_wd_desired_capabilities='{ "moz:firefoxOptions": { "prefs": { "intl.accept_languages": "en-US, en" } } }'
    ;;
  "ja-JP") name_locale="ja" ; wd_lang_env="ja_JP.utf-8" ; test_lang="ja-JP" ;
    test_wd_desired_capabilities='{ "moz:firefoxOptions": { "prefs": { "intl.accept_languages": "ja-JP, en-US, en" } } }'
    ;;
  *) echo "Unknown \$WD_LOCALE: $WD_LOCALE"; exit 1 ;;
esac

case $WD_TZ in
  "UTC")                 name_tz="utc" ; wd_tz_env="UTC"                 ; test_tz="UTC"                 ;;
  "America/Los_Angeles") name_tz="us"  ; wd_tz_env="America/Los_Angeles" ; test_tz="America/Los_Angeles" ;;
  "Asia/Tokyo")          name_tz="jp"  ; wd_tz_env="Asia/Tokyo"          ; test_tz="Asia/Tokyo"          ;;
  *) echo "Unknown \$WD_TZ: $WD_TZ"; exit 1 ;;
esac

echo "#"
echo "# Run tests (UA: $WD_UA, Locale: $WD_LOCALE, TimeZone: $WD_TZ)"
echo "#"

container_name="wd-$name_ua-$name_tz-$name_locale"
test_name="$name_ua-$name_tz-$name_locale"
test_results_dir=${CIRCLE_ARTIFACTS:-"$PROJECT_DIR_ABS/local"}/test/results/$test_name
docker_log_path=${CIRCLE_ARTIFACTS:-"$PROJECT_DIR_ABS/local"}/test/docker-log-$test_name.text

$DOCKER run --name $container_name -e "TZ=$wd_tz_env" -e "LANG=$wd_lang_env" -v $mount_spec -d -p "$wd_port:$wd_port" -t $image_name

TEST_WD_URL="http://localhost:$wd_port" \
  TEST_URL_QUERY_STRING="env=$test_tz:$test_lang" \
  TEST_WD_DESIRED_CAPABILITIES=$test_wd_desired_capabilities \
  TEST_RESULTS_DIR=$test_results_dir \
  timeout 600s $PERL $PROJECT_DIR_ABS/t/run-qunit-tests.pl
test_result=$?

$DOCKER logs $container_name > $docker_log_path
$DOCKER kill $container_name

exit $test_result
