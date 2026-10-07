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
				path += '&' + new URLSearchParams(searchData);
			}
			const results = await fetch(path, {
				method: 'GET',
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
				method: 'GET',
			});
			return await result.json();
		} catch (error) {
			console.error(error);
		}
	}

	// The API's PTN with each move's remaining clock written as a PTN Ninja clock
	// note. Returns null when it can't be fetched, e.g. from an API predating the
	// clocks option, which ignores it and still answers with plain PTN.
	public async getPTNWithClocks(id: string): Promise<string | null> {
		try {
			const result = await fetch(`${this.API_HOST}/ptn/${id}?clocks=true`, {
				method: 'GET',
			});
			const ptn = await result.text();
			// A missing game is answered with a JSON error body, not PTN.
			return result.ok && ptn.startsWith('[') ? ptn : null;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public async getDBInfo() {
		try {
			const url = `${this.API_HOST}/db`;
			const result = await fetch(url, {
				method: 'GET',
			});
			return await result.json();
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}