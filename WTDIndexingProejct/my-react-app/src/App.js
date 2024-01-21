import React, { useState, useEffect } from "react";
import DataTable from "./components/DataTable";
import SearchBar from "./components/SearchBar";
import IndexBar from "./components/IndexBar";
import "./App.css";
function App() {
	// const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	// version that clears search term after a search and handles empty search term
	const fetchData = async (searchQuery = "") => {
		setIsLoading(true);
		let url = "https://csvproject.fly.dev/data/";
		if (searchQuery) {
			// Modify the URL for search endpoint if there's a search query
			url = `https://csvproject.fly.dev/search/${searchQuery}/`;
		}

		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error("Network response was not ok.");
			const json = await response.json();
			setFilteredData(json);
		} catch (error) {
			console.error("Error fetching data: ", error);
			setError(error.toString());
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = (searchQuery) => {
		if (searchQuery.trim() === "") {
			// If the search term is empty, fetch all records
			fetchData();
		} else {
			fetchData(searchQuery);
		}
	};

	const handleIndex = async (index) => {
		try {
			const response = await fetch(
				`https://csvproject.fly.dev/data/${index}/`
			);
			if (!response.ok) throw new Error("Network response was not ok.");
			const json = await response.json();
			setFilteredData(json);
		} catch (error) {
			console.error("Error in indexing: ", error);
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="appContainer">
			<header className="appHeader">
				<h1>
					Welcome to the data indexing tool for the{" "}
					<a href="https://dhprojects.bc.edu/s/travelanddescription/page/welcome">
						WTD project
					</a>
					.
				</h1>
				<p>
					This tool allows you to search records and browse data
					efficiently. You can search for a specific record by typing
					a search term in the search bar, or you can browse records
					by clicking on a letter in the index bar. If you would like
					to view the raw dataset,{" "}
					<a
						href="https://raw.githubusercontent.com/brlehman/bcdhprojectslab/main/WTDIndexingProejct/TDnameIndex.csv"
						target="_blank"
						rel="noopener noreferrer"
					>
						click here
					</a>
					.
					<br />
					<br />
					<b>
						<i>
							Disclaimer: This tool is intended to be used as a
							reference for the WTD databse. This tool is authored
							by Le Lyu and supervised by Bee Lehman from the
							Digital Humanities Lab of the Institute of Liberal
							Arts at Boston College. If you have any concerns,
							reach out to me at lyule@bc.edu or lehmanbr@bc.edu.
						</i>
					</b>
				</p>
			</header>
			<SearchBar onSearch={handleSearch} />
			<IndexBar onIndex={handleIndex} />
			<DataTable data={filteredData} />
		</div>
	);
}

export default App;
