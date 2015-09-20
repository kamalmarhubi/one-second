const curriculum = [
    {
        'text': `<p>Welcome to the first program! This one is just to get you on
         your feet: how many loops can you go through in a second? (it might
         be more than you think!)</p>`,
        'programs': ["sum.c", "loop.py"],
    },
    {

        'text': `<p>Now that we know about the most we can expect from Python
         (100 million things/s), let's explore a slightly more realistic use
         case. Dictionaries are used just about everywhere in Python, so how
         many elements can we add to a dictionary in Python in a second?</p>

        <p>
        Once you've gotten that one, let's look at a more complicated operation
        -- using Python's built-in HTTP request parser to parse a request.
        </p>
         `,

        'programs': ["dict.py", "parse_http_request.py"],
    },
    {
        'text': `<p>Next up, we have downloading a webpage vs running a Python script! 
            Hint: these are both less than 100 million :)</p>`,
        'programs': ["download_webpage.py", "run_python.sh"],
    },
    {
        'text': `
            <p>
            File time! Sometimes I run a huge grep and it takes FOREVER. How many
            bytes can grep search in a second?
            </p>

            <p>
            Note when doing this one that the bytes grep is reading are already in memory.
            This will give us an idea of
            how much of grep's slowness is because of the search
            time required, and how much is because it needs to read from disk.
            </p>

            <p>
            Listing files also takes time! How many files can find list in a second?
            </p>
        `,
        'conclusion': `
            Great! Now we know that grep can search at 2GB/s, so at least in this case,
            we're limited more by the disk speed than grep's speed`,

        'programs': ["grep_bytes.sh", "find-filenames.sh"],
    },
    {
        'text': `
            <p>
            Serialization is a pretty common place to spend a lot of time, and
            it can really hurt, especially if you end up serializing/deserializing
            the same data repeatedly.
            Here are a couple of benchmarks: of parsing 64K of JSON, and the
            same data encoded in msgpack format.
            </p>
        `,
        'programs': ["json_parse.py", "msgpack_parse.py"],
    },    {
        'text': `
            <p>
            DATABASES. We don't have anything fancy like PostgreSQL for you,
            but we made 2 copies of a SQLite table with 10 million rows, one
            indexed and one unindexed.
            </p>
        `,
        'programs': ["database_indexed.py", "database_unindexed.py"],
    },
    {
        'text': `
            <p>
            Hashing time! Here we'll compare MD5 (which is designed to be
            fast) to bcrypt (which is designed to be slow). You can hash quite
            a bit of stuff in a second with MD5; not so with bcrypt.
            </p>
        `,
        'programs': ["hash.py", "bcrypt_hash.py"]
    },
    {
        'text': `
            <p>
            Next up, let's talk about memory access. Are memory accesses
            expensive? (yes they are!). Let's see how accessing memory in-order vs
            out-of-order affects performance. You might want to refer to 
            <a href="https://gist.github.com/jboner/2841832">Latency Numbers Every Programmer Should Know</a>
            to guess at this one. (L1 cache reference vs main memory reference)
            </p>
        `,
        'programs': ["fill_array.c", "fill_array_out_of_order.c"]
    },
    {
        'text': `
            <p>
            How many bytes can you write to disk in a second? We all know writing
            to memory is faster, but how *much* faster? This code was run on a
            computer with an SSD
            </p>
        `,

        'programs': ["write_to_disk.py", "write_to_memory.py"]
    }
]

export default curriculum
