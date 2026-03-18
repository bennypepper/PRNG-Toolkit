# PRNG-toolkit
A web-based tool to generate, test, and visualize pseudo-random numbers using various algorithms and statistical tests.
RNG-Suite is a comprehensive, single-file web application designed for generating, analyzing, and visualizing pseudo-random numbers. It provides a user-friendly interface to explore different generation algorithms, perform rigorous statistical tests on the output, and understand the quality of the generated sequences. This tool is perfect for educational purposes, simulations, and for anyone interested in the practical aspects of random number generation.
<img width="1452" height="959" alt="image" src="https://github.com/user-attachments/assets/28292e32-04eb-401e-8d5a-1a6b1ba4854b" />

## ✨ Features

- **Multiple Generation Algorithms**:
  - **Linear Congruential Generator (LCG)**: With presets from famous implementations (`Numerical Recipes`, `glibc`, `Java`) and custom parameter inputs.
  - **Middle-Square**: A classic algorithm by John von Neumann.
  - **Xorshift**: A fast and high-quality generator.

- **Flexible Generation Options**:
  - Generate a specific quantity of numbers with presets or custom amounts.
  - Manual or automatic seed generation.
  - **Configurable Auto-Seed**: Set the desired digit length for automatically generated seeds, crucial for methods like Middle-Square.

<img width="1518" height="926" alt="image" src="https://github.com/user-attachments/assets/d59cc409-a653-4046-ab9b-9915c5598ceb" />

- **Comprehensive Statistical Testing**:
  - **Test Your Own Data**: Upload a `.csv`, `.xlsx`, or `.txt` file with your own numbers for analysis.
  - **Formal Hypothesis Testing**: Each test result is presented with a Null Hypothesis (H₀) and a clear conclusion (e.g., "Fail to reject H₀").
  - **Included Tests**:
    - Frequency Test (Monobit)
    - Runs Test
    - Chi-Square Uniformity Test
    - Autocorrelation Test
    - Poker Test

- **Insightful Visualizations**:
  - **Histogram**: Visually check for number uniformity with the Chi-Square test results.
  - **Scatter Plot**: Analyze number independence by plotting `R(i)` vs `R(i+1)` in the Autocorrelation test.

- **User-Friendly Interface**:
  - **Multi-tab Layout**: Separate panels for Generation, Testing/Visualization, and Information.
  - **Tooltips & Guides**: Helpful information about parameters and file formats.
  - **Configuration Management**: Save, load, and reset your generator settings to easily replicate experiments.

- **Versatile Export Options**:
  - Download generated numbers as `.csv`, `.xlsx`, or `.txt`.
  - Choose between `Raw` integer output or `Normalized` (0-1) floating-point values.

## 🚀 How to Use

This is a single-file application with no dependencies or build steps required.

1.  **Download**: Download the `index.html` file from this repository.
2.  **Open**: Open the `index.html` file in any modern web browser (like Chrome, Firefox, or Edge).
3.  **Generate & Test**:
    - Select a generation method and configure its parameters on the **Generator** tab.
    - Click **"Generate & Test"**.
    - View the results and charts on the **Tester & Visualizer** tab.

## 🛠️ Technologies Used

-   **HTML5**
-   **Tailwind CSS**: For a clean and responsive UI.
-   **JavaScript (ES6+)**: For all logic and functionality.
-   **Chart.js**: For creating interactive charts and visualizations.
-   **SheetJS (xlsx.js)**: For parsing and creating `.xlsx` files.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, tests, or improvements, please feel free to fork the repository and submit a pull request. You can also open an issue to report bugs or suggest enhancements.
