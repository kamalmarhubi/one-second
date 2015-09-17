const curriculum = [
    {
        'text': 'Welcome to the first program! This one is just to get you on your feet: how many loops can you go through in a second? (it might be more than you think!)',
        'programs': ["sum.c", "loop.py"],
    },
    {
        'text': ["Next up, we have downloading a webpage vs running a Python script!"],
        'programs': ["download_webpage.py", "run_python.sh"],
    },
    {
        'text': ["Hashing! Request parsing! How many HTTP requests can we parse in Python in a second?"],
        'programs': ["hash.py", "parse_http_request.py"]
    },
    {
        'text': ["Next up, let's talk about memory access. Are memory accesses expensive? (yes they are!). Let's see how accessing memory in-order vs out-of-order affects performance."],
        'programs': ["fill_array.c", "fill_array_out_of_order.c"]
    },
    {
        'text': ["How many bytes can you write to disk in a second? We all know writing to memory is faster, but how *much* faster? This code was run on a computer with an SSD."],
        'programs': ["write_to_disk.py", "write_to_memory.py"]
    }
]

export default curriculum
