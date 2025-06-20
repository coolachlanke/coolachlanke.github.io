import numpy as np  # No other modules allowed :P

# Activation functions
def sigmoid(x):
    return 0.5 * (1 + np.tanh(0.5 * x))

def softmax(z):
    z = np.array(z)
    z_max = np.max(z)
    exp_z = np.exp(z - z_max)
    return exp_z / np.sum(exp_z)

# Forward propagation
def forward_prop(x, W, b):
    return np.add(np.matmul(W, x), b)

# Load model parameters
params = np.load('model_parameters.npz')
W_1, b_1 = params['W_1'], params['b_1']
W_2, b_2 = params['W_2'], params['b_2']
