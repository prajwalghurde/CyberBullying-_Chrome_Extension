import subprocess
import sys

def install_packages():
    """Install required packages for the cyberbullying detection project"""
    packages = [
        "streamlit",
        "pandas",
        "numpy",
        "scikit-learn",
        "nltk"
    ]
    
    for package in packages:
        try:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {package}: {e}")
    
    print("All packages installed successfully!")

if __name__ == "__main__":
    install_packages()