"""Setup script for OpenAI Agents Course Generator."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="openai-course-generator",
    version="1.0.0",
    author="Course Generation Team",
    author_email="team@learnfinity.com",
    description="Intelligent course generation using OpenAI Agents SDK",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-org/openai-course-generator",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.9",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.5.0",
        ],
        "multimedia": [
            "moviepy>=1.0.3",
            "opencv-python>=4.8.0",
            "Pillow>=10.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "openai-course-gen=openai_course_generator.workflow.course_runner:main",
        ],
    },
    include_package_data=True,
    package_data={
        "openai_course_generator": ["config/*.yaml", "templates/*.json"],
    },
)