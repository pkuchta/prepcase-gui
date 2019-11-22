from flask import Flask
from flask.helpers import safe_join
from flask_jsonrpc import JSONRPC
from flask_cors import CORS
import os
import json
import subprocess
from operator import add
import logging

import env

app = Flask(__name__)
CORS(app) # allow CORS for all domains (FOR DEVELOPMENT SERVER)
jsonrpc = JSONRPC(app, '/', enable_web_browsable_api=True)

# CESM directory on the server
CESM_DIRECTORY = "cesm"
CIME_DIRECTORY = "cesm/cime"
CESM_TOOLS = 'create_clone create_test query_testlists create_newcase query_config'.split()

@jsonrpc.method('App.tools_parameters')
def tools_parameters():
    """
    Return definitions of arguments of CESM tools.
    """

    def read_config(tool):
        config_file = os.path.join(os.path.dirname(__file__), 'config/' + tool + '_parameters.json')
        with open(config_file) as f:
            return json.load(open(config_file))

    return dict([(tool, read_config(tool)) for tool in CESM_TOOLS])


def execute(command):
    """
    Execute a command.

    :param command:  a list: executable name and parameters
    """
    p = subprocess.Popen(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = p.communicate()

    return dict(return_code=p.returncode,
                stdout=stdout,
                stderr=stderr,
                command=" ".join(command))


def ssh_execute(user, hostname, executable, parameters):
    """
    Execute command on remote host via ssh.

    :param command:  a list: executable name and parameters
    """
    command = [executable] + [str(p).strip() for p in parameters]
    command = [txt for txt in command if txt] # Popen doesn't work with empty parameters

    cmd = " ".join(command)
    ssh_command = ["ssh", user + "@" + hostname, cmd]

    logging.info("EXECUTE {}".format(ssh_command))
    return execute(ssh_command)


@jsonrpc.method('App.run_tool')
def run_tool(tool, parameters):
    """
    Run one of the supported command line tools.
    Parameters are accepted as array of strings.
    """
    executable = safe_join(CIME_DIRECTORY, "scripts", tool)
    return ssh_execute(env.REMOTE_USER, env.REMOTE_HOST, executable, parameters)


@jsonrpc.method('App.run_script_in_case')
def run_script_in_case(case_path, script, parameters):
    """
    Run script in case directory.
    Parameters are accepted as array of strings.
    """
    executable = safe_join(case_path, script)
    return ssh_execute(env.REMOTE_USER, env.REMOTE_HOST, "cd " + case_path + " && " + executable, parameters)


@jsonrpc.method('App.list_cases')
def list_cases():
    """
    TODO: List existing user's cases.
    """
    return ['case-A', 'case-B', 'case-C']


@jsonrpc.method('App.get_config')
def get_config(path_name):
    """
    Return content of XML file in CESM directory
    """
    absolute_path_name = safe_join(CESM_DIRECTORY, path_name)
    with open(absolute_path_name, "r") as f:
        return dict(path_name=path_name, data=f.read())


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
