use strict;
use warnings;
use Path::Tiny;
use JSON::PS;

my $RootPath = path (__FILE__)->parent->parent;

my $DTSes = [];
{
  my $DefsPath = $RootPath->child ('local/dts.json');
  my $defs = json_bytes2perl $DefsPath->slurp;
  for my $key (qw(dtsjp1 dtsjp2)) {
    my $v = $defs->{dts}->{$key}->{patterns};
    for (@$v) {
      $_->[0] = ($_->[0] - 2440587.5) #* 24 * 60 * 60 * 1000
          if defined $_->[0];
    }
    push @$DTSes, '"' . $key . '":' . perl2json_bytes $v;
  }
}

print 'TER.defs = {"dts":{', (join ',', @$DTSes), '}};';

## License: Public Domain.
