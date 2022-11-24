export class GameService {
	private API_HOST = import.meta.env.VITE_API_HOST + '/games'

	public async getGames(paginationData?: any, searchData?: any) {
		try {
			let path = this.API_HOST + '?';
			if (paginationData.pagination) {
				const page = paginationData.pagination.page - 1;
				path += new URLSearchParams({
					page: page.toString(),
					limit: paginationData.pagination.rowsPerPage,
				}).toString();
			}
			if (searchData) {
				let data = encodeURI(JSON.stringify({ ...searchData }));
				path += "&" + new URLSearchParams({ search: data, });
			}
			const results = await fetch(path, {
				method: "GET",
			});
			return await results.json();
		} catch (error) {
			console.error(error);
		}
	}

	public async getGameByID(id: string) {
		try {
			const url = `${this.API_HOST}/${id}`;
			const result = await fetch(url, {
				method: "GET",
			});
			return await result.json();
		} catch (error) {
			console.error(error);
		}
	}

	public async getDBInfo() {
		try {
			const url = `${this.API_HOST}/db`;
			const result = await fetch(url, {
				method: "GET",
			});
			return await result.json();
		} catch (error) {
			console.error(error);
		}
	}
}