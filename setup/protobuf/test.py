#!/usr/bin/python

import os, sys, json
from pprint import pprint

import protobuf_json

import test_pb2 as pb_test

# create and fill test message
pb=pb_test.TestMessage()
pb.id=123
pb.flag=True
for i in xrange(1000):
    msgs=pb.nested_msgs.add()
    msgs.id=456
    msgs.title="test title"
    msgs.url="http://localhost/"

for i in xrange(100):
    pb.rep_int.append(i)

json_obj=protobuf_json.pb2json(pb)

with open('message.proto', 'w') as f:
    f.write(pb.SerializeToString())

with open('message.json', 'w') as f:
    f.write(json.dumps(json_obj))

