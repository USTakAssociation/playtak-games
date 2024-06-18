export class GameService {
	private API_HOST = import.meta.env.VITE_API_HOST + '/v1/games-history'

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
				path += "&" + new URLSearchParams(searchData);
			}
			const results = await fetch(path, {
				method: "GET",
			});
			return await results.json();
		} catch (error) {
			console.error('Error: ', error);
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
			return null;
		}
	}
}