<script setup lang="ts">
	import { ref, onMounted, onBeforeMount } from 'vue';
	import { Dark } from 'quasar'
	import Search from '@/components/Search.vue';
	import TableComponent from '@/components/Table.vue'
	import { PTNService } from '@/services/ptn.service';
	import { GameService } from '@/services/game.service';
	
	const lightMode = ref(false);
	const isLoading = ref(false);
	const gameData = ref({});
	const dbData = ref({size: 0, date: ''});
	const pagination = ref({
		page: 0,
		rowsPerPage: 50,
		rowsNumber: 0
	});
	const searchData: any = ref({});
	const openPTNDialog = ref(false);
	const openInfoDialog = ref(false);
	const ptnText = ref('');
	const ptnService = new PTNService;
	const gameService = new GameService;
	
	onBeforeMount(async () => {
		//check pathname values
		const path = window.location.pathname.split('/');
		if (path[2] === 'playtakviewer') {
			// playtakviewer
			const gameData = await getGameById(path[1]);
			return openSite(gameData, 'playtak')
		} else if (path[2] === 'ninjaviewer') {
			// ninjaviewer
			const gameData = await getGameById(path[1]);
			return openSite(gameData, 'ptnninja')
		} else if (path[2] === 'view') {
			// view raw
			const gameData = await getGameById(path[1]);
			return viewPTN(gameData);
		} else {
			const urlSearchParams = new URLSearchParams(window.location.search);
			const params = Object.fromEntries(urlSearchParams.entries());
			searchData.value = params;
			searchGames({}, params);
		}
	})

	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		// dark mode
		Dark.set(true);
	} else {
		lightMode.value = true;
	}
	
	function setSearchData(params: any) {
		let search = params;
		if(search.type) {
			search[search.type.value.name] = search.type.value.value;
		}
		if(search.size){
			search.size = search.size.value;
		}
		if (search.type === null){
			delete search.normal;
			delete search.tournament;
			delete search.unrated;
			delete search.type;
		}
		
		for(const key in search) {
			if (search[key] === null || search[key] === "") {
				delete search[key];
			}
		}
		searchGames({}, search);
	}

	async function searchGames(paginationData: any, search?: any) {
		isLoading.value = true;
		try {
			let d = await gameService.getGames(paginationData, search)
			gameData.value = d;
			pagination.value.page = d.page;
			pagination.value.rowsPerPage = d.perPage;
			pagination.value.rowsNumber = d.total;
			isLoading.value = false;
		} catch (error) {
			console.error(error);
			isLoading.value = false;
		}
	}
	
	async function getGameById(id: string) {
		return await gameService.getGameByID(id);
	}
	
	function updateTheme() {
		Dark.toggle();
	}
	
	function viewPTN(game: any) {
		ptnText.value = ptnService.getPTN(game);
		openPTNDialog.value = true;
	}
	
	async function viewInfo(){
		let dbtemp = await gameService.getDBInfo();
		const BYTES_PER_MB = (1024 ** 2);
		let size = Math.floor(dbtemp.size / BYTES_PER_MB);
		let newdate = new Date(dbtemp.birthtime).toISOString().split('T');
		let date = `${newdate[0]} ${newdate[1].split('.')[0]}`
		dbData.value = {size, date};
		openInfoDialog.value = true;
	}
	
	function getZero(t: any) {
		return t < 10 ? '0' + t : t
	}

	function downloadPTN(game: any){
		var now = new Date();
		var dt = `${now.getFullYear()}-${(now.getMonth() + 1)}-${now.getDate()}-${now.getHours()}:${getZero(now.getMinutes())}`;
		
		const url = window.URL.createObjectURL(new Blob([ptnService.getPTN(game)]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `${game.player_white}-vs-${game.player_black}-${dt}.ptn`);
		document.body.appendChild(link);
		link.click();
	}
	
	function openSite(game: any, site: string, newTab?: boolean){
		if(site === 'playtak') {
			const url = `https://playtak.com/?load=${encodeURI(ptnService.getPTN(game))}`
			if(newTab){
				window.open(url, "_blank");
				return;
			}
			window.location.assign(url);
		}
		
		if(site === 'ptnninja') {
			const url = `https://ptn.ninja/${encodeURI(ptnService.getPTN(game))}`;
			if (newTab) {
				window.open(url, "_blank");
				return;
			}
			window.location.assign(url);
		}
	}
</script>

<template>
	<q-layout view="hHh lpR fFf">
		<q-header elevated class="header-bg text-white">
			<q-toolbar>
				<q-toolbar-title>
					<div class="row items-center no-wrap">
						<div class="logo">
							<svg class="tak-logo" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
								<!-- Peice -->
								<path class="piece"
									d="m 42.919509,60.795211 51.601746,12.494554 a 0.0960735,0.0720914 0 0 1 0.0141,0.133019 L 58.3022,87.100923 a 0.57617763,0.4323415 0 0 1 -0.432706,0.02605 L 6.3685306,74.902911 A 0.09651292,0.07242062 0 0 1 6.3544527,74.769448 L 42.49086,60.821213 a 0.56419129,0.42335175 0 0 1 0.431348,-0.02642 z m 15.59031,26.226173 35.816588,-13.519573 c 0.115699,-0.04359 0.364696,-0.116692 0.405875,-0.03798 0.0159,0.02912 0.0123,0.134431 0.0123,0.231529 v 10.839848 c 0,0.09717 -0.002,0.261038 -0.0754,0.339527 -0.057,0.06143 -0.227517,0.126543 -0.343135,0.170133 L 58.509402,98.56444 c -0.115692,0.0436 -0.364696,0.116699 -0.405883,0.038 -0.01593,-0.02911 -0.01229,-0.134429 -0.01229,-0.231528 V 87.531053 c 0,-0.09719 0.0019,-0.261038 0.07546,-0.339515 0.05701,-0.06141 0.227511,-0.12653 0.343128,-0.170133 z M 6.5909438,74.955355 57.644437,87.07285 c 0.123447,0.02925 0.334703,0.08146 0.39989,0.162944 0.0469,0.05876 0.0469,0.197641 0.0469,0.29474 v 10.806659 c 0,0.0972 -0.01229,0.289106 -0.128586,0.304526 -0.05169,0.007 -0.1949,-0.0296 -0.31827,-0.0589 L 6.5908848,86.465349 C 6.4674374,86.436099 6.25618,86.383889 6.1909939,86.302406 6.1440949,86.243666 6.1440949,86.104778 6.1440949,86.007666 V 75.201009 c 0,-0.09719 0.01229,-0.289097 0.1285844,-0.304538 0.051699,-0.0066 0.1948856,0.02962 0.31827,0.05886 z"
									clip-rule="evenodd" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" />
								<g transform="matrix(1.2267528,0,0,1.206118,-10.954756,-4.729633)">
									<!-- Vector bg -->
									<rect class="cap-bg" x="47.185001" y="7.2543998" width="5.5093999" height="59.41" />
									<!-- Cap -->
									<g class="capstone" transform="matrix(1.1662,0,0,1.1398,-8.8859,1.6673)" clip-rule="evenodd" fill-rule="evenodd"
										stroke-linecap="round" stroke-linejoin="round">
										<path
											d="m 50.509,2.8467 c 0,0 9.464,0.20514 11.774,4.2286 0,0 0.16285,0.84107 -1.1261,1.5734 0,0 7.3975,4.9315 6.9616,8.5554 l -7.6781,17.701 2.2523,3.1467 c 0,0 4.1313,1.8085 4.2998,5.4085 0,0 -0.04153,2.0779 -1.2285,3.3435 0,0 1.035,2.1715 0.51187,5.4085 0,0 -0.72194,6.4896 -15.765,6.8836" />
										<path
											d="m 50.811,2.8467 c 0,0 -9.464,0.20514 -11.774,4.2286 0,0 -0.16285,0.84107 1.1261,1.5734 0,0 -7.3975,4.9315 -6.9616,8.5554 l 7.6781,17.701 -2.2523,3.1467 c 0,0 -4.1313,1.8085 -4.2998,5.4085 0,0 0.04153,2.0779 1.2285,3.3435 0,0 -1.035,2.1715 -0.51187,5.4085 0,0 0.72194,6.4896 15.765,6.8836" />
										<path d="m 40.115,8.6484 c 0,0 7.6515,1.8291 21.294,0" />
										<path d="m 35.508,46.805 c 0,0 14.515,9.2359 30.507,0" />
										<path d="m 38.583,38.056 c 0,0 11.188,5.0762 24.365,0" />
										<path d="m 40.83,34.905 c 0,0 8.9152,3.0684 19.861,0" />
									</g>
								</g>
							</svg>
						</div>
						<span>Game History</span>
					</div>
				</q-toolbar-title>
				<q-space />
				<q-btn to="/" stretch flat label="Play Tak" />
				<q-btn stretch flat label="Info" @click="viewInfo()"/>
				<q-toggle v-model="lightMode" color="red" @update:model-value="updateTheme" /><q-icon name="light_mode" size="large" />
			</q-toolbar>
		</q-header>

		<q-page-container class="container">
			<Search :data="searchData" @search-event="setSearchData" />
			<div class="row justify-center align-items-center q-mt-md">
				<q-spinner class="" color="primary" v-if="isLoading" size="5em"></q-spinner>
			</div>
			<TableComponent v-if="gameData && !isLoading" 
				:data="gameData" 
				:pagination="pagination" 
				@page-event="searchGames" 
				@view-event="viewPTN"
				@download-event="downloadPTN"
				@open-event="openSite"
				/>
			
			<q-dialog v-model="openPTNDialog">
				<q-card style="width: 300px" class="q-pb-none">
					<q-card-section class="row justify-between">
						<h3 class="q-ma-none">PTN</h3>
						<div >
							<q-btn flat round icon="close" v-close-popup />
						</div>
					</q-card-section>
					<q-card-section class="row items-center q-pt-none">
						<pre>{{ptnText}}</pre>
					</q-card-section>
				</q-card>
			</q-dialog>
			
			<q-dialog v-model="openInfoDialog">
				<q-card style="width: 50vw" class="q-pb-none">
					<q-card-section class="row items-center q-pt-none">
						<p class="q-mt-md">Games before 23rd April 2016 5:00 PM UTC are anonymized and won't appear when searching with player name</p>
						<p>
						Please don't scrape this site. You can directly download the database here: <br>
						<a href="/games_anan.db">Games Database</a>
						({{dbData.size}} MB) (updated on {{dbData.date}}) <br> 
						note that the notation is in play tak server format.</p>
						<p>
						The link above will be updated with latest database every day at 5:00 PM UTC.
						</p>
					</q-card-section>
				</q-card>
			</q-dialog>
		</q-page-container>
	
	</q-layout>
	
</template>

<style scoped>
.header-bg {
	background-color: #35455e;
}
.container {
	width: 80vw;
	margin:  auto;
}
 a {
	color: #03a9f4;
 }
.logo {
	min-width: 30px;
	padding: 8px 0px 0 0px;
	margin-right: 16px;
}

path {
	fill-opacity: 1;
	stroke-miterlimit: 4;
	stroke-dasharray: none;
	stroke-linejoin: bevel;
	stroke-linecap: round;
	stroke-width: 2px;
}

.cap-bg {
	fill: #fff;
	stroke: #000
}

.piece {
	fill: #000;
	stroke: #fff;
	stroke-width: 1.5px;
}

.capstone path {
	fill: #fff;
	stroke: #000;
	stroke-width: 1px
}
</style>