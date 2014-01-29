#!/usr/bin/python
# coding=utf-8

from __future__ import with_statement
from fabric.contrib.console import confirm
from fabric.api import *

env.hosts = ["79.125.15.191"]
env.user = "jenkins"

def deploy():
    '''
    On testing server update to latest commit
    '''
    with cd('/home/deploy/AudioPlayer'):
	run('pwd')
	run('ls')
        sudo('git reset --hard origin/master', user="deploy")
        sudo('git pull', user="deploy")

