const curriculum = [
    {
        'text': `<p>Welcome to the first program! This one is just to get you on
         your feet: how many loops can you go through in a second? (it might
         be more than you think!)</p>`,
        'programs': ["sum.c", "loop.py"],
        'conclusion': `
            When I see code like this, I think about how much time a millisecond is 
            -- it's imperceptible to me, but apparently you can run 68,000
            iterations of an empty loop in a millisecond, even in Python!
        `
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
        'conclusion': `
            We can parse 25,000 small HTTP requests per second! One thing I want to
            point out here is that the request parsing code is written in pure Python,
            not C -- so we can actually do a quite nontrivial amount of work in
            40 microseconds.
        `
    },
    {
        'text': `<p>Next up, we have downloading a webpage vs running a Python script! 
            Hint: these are both less than 100 million :)</p>`,
        'programs': ["download_webpage.py", "run_python.sh"],
        'conclusion': `
            Starting a program is actually already expensive by itself, not just starting Python.
            If we just run /bin/true, we can do 500 of them in a second, so it looks like
            running any program has about 1ms of overhead. The cost of downloading a webpage of course
            depends a lot the size, connection speed, and distance from the servers, 
            and we're not going to get further into network performance 
            (network performance is SO INTERESTING). Friends who do high performance networking
            say it's possible to get network roundtrips of 250ns (!!!), 
            but that's with much closer computers, and fancier hardware.
            For us and Google, it's a million times longer </3.
            Light can only travel a foot in a nanosecond, and Google is much more than 250 feet away.
        `
    },
    {
        'text': `
            <p>
            How many bytes can you write to disk in a second? We all know writing
            to memory is faster, but how *much* faster? This code was run on a
            computer with an SSD
            </p>
        `,

        'programs': ["write_to_disk.py", "write_to_memory.py"],
        'conclusion': `
            Disks are slower than memory, and this matters even if you're using a 'slow' language like Python,
            and if you have an extremely fast disk (my SSD has been known to write at > 500MB/s, which is *fast*).
            A lot of things end up being dominated by disk speed. We'll see that in the next example!
        `
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
            we're limited more by the disk speed than grep's speed.`,

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
        'conclusion': `
            Basically every single person we talked to about serialization mentioned that capnproto
            does instant serialization. We just want you to know that deserializing
            64K of data can take a millisecond (a LONG TIME, as we now know), and
            that your choice of format and library makes a big difference.
        `
    },    {
        'text': `
            <p>
            DATABASES. We don't have anything fancy like PostgreSQL for you,
            but we made 2 copies of a SQLite table with 10 million rows, one
            indexed and one unindexed.
            </p>
        `,
        'programs': ["database_indexed.py", "database_unindexed.py"],
        'conclusion': `
            Not a big surprise: indexes are amazing. 20ish microseconds for an indexed query
            means that if this were over a network to a faraway database server,
            the time to query would be dominated by the network roundtrip time to the server.
        `
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
            Next up, let's talk about memory access. CPUs these days have L1 and L2 caches,
            which are much faster to access than main memory. This means that accessing memory
            sequentially (where the CPU can load a bunch of data into a cache) will normally give you faster code than
            accessing memory out of order.
            </p>
            <p>
            Let's see how that shakes out in practice! You might want to refer to 
            <a href="https://gist.github.com/jboner/2841832">Latency Numbers Every Programmer Should Know</a>
            to guess at this one.
            </p>
        `,
        'programs': ["fill_array.c", "fill_array_out_of_order.c"],
        'conclusion': `
            We don't write a lot of C, so this doesn't affect us very often.
            But if you care about how many nanoseconds your operations take
            (which you do if you're trying to do a billion things a second, which computers can),
            you care about this kind of thing a lot.
        `
    }
]

export default curriculum
