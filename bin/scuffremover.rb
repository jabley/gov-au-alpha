#!/usr/bin/env ruby
# scuff remover, remove bad mark(down file)s

require 'digest/md5'

mdfiles = []
mdfilenames = []
emptymdfiles = []
hashedmdfiles = {}
mdhashes = []
for mdfile in Dir['**/*.md']
  #print mdfile +"\n"
  mdfiles << mdfile
  mdfilenames << File.basename(mdfile)
  if File.open(mdfile).size < 2
    emptymdfiles << mdfile
  end
  hash = Digest::MD5.file(mdfile).hexdigest
  mdhashes << hash
  #if (hash not in hashedmdfiles)
  #  hashedmdfiles[hash] = []
  #end
# hashedmdfiles[hash] << mdfile
end
htmlfiles = []
htmlfilenames = []
usedmdfilenames = []
for htmlfile in Dir['**/*.html']
  #print htmlfile+"\n"
  htmlfiles << htmlfile
  htmlfilenames << File.basename(htmlfile)
  File.read(htmlfile).each_line do |li|
    result = /(.*)\/(.*.md)/.match(li)
    if result
      usedmdfilenames << result[2]
    end

  end
end

# duplicate markdown file name
print "md dupes: "+ (mdfilenames - (mdfilenames& mdfilenames)).join("\n")
# duplicate html file name
print "\nhtml dupes: "+ (htmlfilenames - (htmlfilenames&htmlfilenames)).join("\n")
# unused markdown file
unused = (mdfilenames - usedmdfilenames)
print "\n unused: "+ (mdfilenames - usedmdfilenames).join("\n")
for mdfile in mdfiles
  for unfile in unused
    if mdfile.end_with?(unfile)
      puts ("\ngit rm ./"+ mdfile)
    end
  end
end
# markdown file with identical content
#print "identical: "+ (hashedmdfiles.detect { |e| count(hashedmdfiles[e]) > 1 }).join(",")
# markdown file empty
print "\n empty: "+ (emptymdfiles).join("\n")