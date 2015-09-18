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
         many strings can we add to a dictionary in Python in a second?</p>

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
            files do you think we can grep in a second? What if we just list the
            filenames instead?
            </p>
        `,
        'programs': ["grep_files_and_fail.sh", "find-filenames.sh"],
    },
    {
        'text': `
            <p>
            Hashing! Request parsing! How many HTTP requests can we parse in
            Python in a second?
            </p>
        `,
        'programs': ["hash.py", "parse_http_request.py"]
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
