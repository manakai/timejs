use strict;
use warnings;
use Path::Tiny;
use lib glob path (__FILE__)->parent->parent->child ('t_deps/modules/*/lib');
use Promise;
use Web::URL;
use Web::Driver::Client::Connection;

my $test_wd_en_url = $ENV{TEST_WD_EN_URL};
my $test_wd_ja_url = $ENV{TEST_WD_JA_URL};

sub run_tests {
  print "1..2\n";
  execute_test_html_file ($test_wd_en_url, q<file:///project/t/time-ter-tests.html?locale=en-US>);
  execute_test_html_file ($test_wd_ja_url, q<file:///project/t/time-ter-tests.html?locale=ja-JP>);
}

sub execute_test_html_file {
  my ($test_wd_url, $test_url) = @_;
  my $wd_url = Web::URL->parse_string ($test_wd_url);
  Promise->resolve (1)->then (sub {
    my $wd = Web::Driver::Client::Connection->new_from_url ($wd_url);
    my $p = $wd->new_session (desired => {})->then (sub {
      my $session = $_[0];
      my $p = $session->go (Web::URL->parse_string ($test_url))->then (sub {
        return $session->execute (q{
          var elems = document.querySelectorAll("#qunit-tests > li");
          return Array.prototype.map.call(elems, function (e, i) {
            return e.classList.contains("pass") ?
                ["ok"] :
                ["not ok", e.textContent.replace(/\n/g, " ")];
          });
        });
      })->then (sub {
        my $res = $_[0];
        my $test_lines = $res->json->{value};
        for my $line_items (@$test_lines) {
          print join('-', @$line_items), "\n";
        }
      });
      return $p->catch (sub {})->then (sub {
        return $session->close;
      })->then (sub { return $p; });
    });
    return $p->catch (sub {})->then (sub {
      return $wd->close;
    })->then (sub { return $p; });
  })->to_cv->recv;
}

run_tests();
