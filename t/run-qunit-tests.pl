use strict;
use warnings;
use Path::Tiny;
use lib glob path (__FILE__)->parent->parent->child ('t_deps/modules/*/lib');
use IO::File;
use Promise;
use Web::URL;
use Web::Driver::Client::Connection;

my $root_path = path (__FILE__)->parent->parent;

# Notes
# * On Firefox,
#   * `Date.prototype.toLocaleString` method depends on locale of OS, and
#   * `navigator.language` depends on `intl.accept_languages` of prefs.

my $LANG_TO_PREF_MAP = {
  'en' => {
    query_string => '?locale=en-US',
    wd_desired_capabilities => {
      'moz:firefoxOptions' => { 'prefs' => { 'intl.accept_languages' => 'en-US, en' } },
    },
  },
  'ja' => {
    query_string => '?locale=ja-JP',
    wd_desired_capabilities => {
      'moz:firefoxOptions' => { 'prefs' => { 'intl.accept_languages' => 'ja-JP, en-US, en' } },
    },
  },
};

sub run_tests {
  my $test_wd_url = $ENV{TEST_WD_URL} || die 'Environment variable `TEST_WD_URL` must be set`';
  my $test_lang = $ENV{TEST_LANG} || die 'Environment variable `TEST_LANG` must be set`';
  my $test_results_path = defined $ENV{TEST_RESULTS_DIR} ? path ($ENV{TEST_RESULTS_DIR}) : $root_path->child ("local/test/results");

  my $test_pref = $LANG_TO_PREF_MAP->{$test_lang} || die "Unknown `TEST_LANG` value : $test_lang";
  my $query_string = $test_pref->{query_string};
  my $wd_desired_capabilities = $test_pref->{wd_desired_capabilities};

  $test_results_path->mkpath;
  my $exit_code = 0;
  for my $path ($root_path->child ('t')->children (qr/\.html\z/)) {
    my $url = "file:///project/${path}${query_string}";
    my $result_path = $test_results_path->child ($path->basename);
    print "# $path\n";
    my $pass = execute_test_html_file ($test_wd_url, $wd_desired_capabilities, $url, $result_path);
    if ($pass) {
      print "ok - $url -> $result_path\n";
    } else {
      print "not ok - $url -> $result_path\n";
      $exit_code = 1;
    }
  }
  return $exit_code;
}

sub execute_test_html_file {
  my ($test_wd_url, $wd_desired_capabilities, $test_url, $test_result_file_path) = @_;
  my $all_tests_passed = 0;

  my $wd_url = Web::URL->parse_string ($test_wd_url);
  Promise->resolve (1)->then (sub {
    my $wd = Web::Driver::Client::Connection->new_from_url ($wd_url);
    my $p = $wd->new_session (desired => $wd_desired_capabilities)->then (sub {
      my $session = $_[0];
      my $p = $session->go (Web::URL->parse_string ($test_url))->then (sub {
        return $session->execute (q{
          var allTestsPassed = document.querySelector("#qunit-banner").classList.contains("qunit-pass");
          var clonedHead = document.querySelector("head").cloneNode(true);
          Array.prototype.forEach.call(clonedHead.querySelectorAll("script"), function (e) {
            clonedHead.removeChild(e);
          });
          var clonedBody = document.querySelector("body").cloneNode(true);
          ["#qunit-testrunner-toolbar", "#qunit-testresult"].forEach(function (selector) {
            var elem = clonedBody.querySelector(selector);
            elem.parentElement.removeChild(elem);
          });
          return {
            allTestsPassed: allTestsPassed,
            testResultsHtmlString:
                "<!DOCTYPE html>\n<html>\n" + clonedHead.outerHTML + "\n" + clonedBody.outerHTML + "\n</html>\n"
          };
        });
      })->then (sub {
        my $res = $_[0];
        $all_tests_passed = $res->json->{value}->{allTestsPassed};

        my $fh = IO::File->new($test_result_file_path, ">:encoding(utf8)");
        die "File open failed: $test_result_file_path" if not defined $fh;
        print $fh $res->json->{value}->{testResultsHtmlString};
        undef $fh;
      });
      return $p->catch (sub {})->then (sub {
        return $session->close;
      })->then (sub { return $p; });
    });
    return $p->catch (sub {})->then (sub {
      return $wd->close;
    })->then (sub { return $p; });
  })->to_cv->recv;

  return $all_tests_passed;
}

my $exit_code = run_tests();
exit $exit_code;

=head1 LICENSE

Copyright 2017 Wakaba <wakaba@suikawiki.org>.  All rights reserved.
Copyright 2017 Hatena <http://hatenacorp.jp/>.  All rights reserved.

This program is free software; you can redistribute it and/or
modify it under the same terms as Perl itself.

Alternatively, the contents of this file may be used
under the following terms (the "MPL/GPL/LGPL"),
in which case the provisions of the MPL/GPL/LGPL are applicable instead
of those above. If you wish to allow use of your version of this file only
under the terms of the MPL/GPL/LGPL, and not to allow others to
use your version of this file under the terms of the Perl, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the MPL/GPL/LGPL. If you do not delete
the provisions above, a recipient may use your version of this file under
the terms of any one of the Perl or the MPL/GPL/LGPL.

"MPL/GPL/LGPL":

Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this file are subject to the Mozilla Public License Version
1.1 (the "License"); you may not use this file except in compliance with
the License. You may obtain a copy of the License at
<http://www.mozilla.org/MPL/>

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is TER code.

The Initial Developer of the Original Code is Wakaba.
Portions created by the Initial Developer are Copyright (C) 2008
the Initial Developer. All Rights Reserved.

Contributor(s):
  Wakaba <wakaba@suikawiki.org>

Alternatively, the contents of this file may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this file only
under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this file under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the LGPL or the GPL. If you do not delete
the provisions above, a recipient may use your version of this file under
the terms of any one of the MPL, the GPL or the LGPL.

=cut
