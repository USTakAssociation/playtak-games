<script setup lang="ts">
	import { ref } from 'vue'
	const emit = defineEmits<{
		(e: 'searchEvent', props: any): void
	}>()
	const formValidation = ref<{ disable: boolean, hasError: boolean, message: string }>({
		disable: false,
		hasError: false,
		message: ''
	})
	const searchData = defineProps<{
		data: any,
	}>();
	const formData: any = ref(searchData.data);
	const resultOptions = [
		{ group: 'White Wins', disable: true },
		{ label: 'X-0', value: 'X-0', description: 'Any Win' },
		{ label: 'R-0', value: 'R-0', description: 'Road Win' },
		{ label: 'F-0', value: 'F-0', description: 'Flat Win' },
		{ label: '1-0', value: '1-0', description: 'Default Win' },
		{ group: 'Black Wins', disable: true },
		{ label: '0-X', value: '0-X', description: 'Any Win' },
		{ label: '0-R', value: '0-R', description: 'Road Win' },
		{ label: '0-F', value: '0-F', description: 'Flat Win' },
		{ label: '0-1', value: '0-1', description: 'Default Win' },
		{ group: 'Draw', disable: true },
		{ label: '1/2-1/2', value: '1/2-1/2', description: 'Draw' }
	];
	const sizeOptions = [
		{ label: '3 x 3', value: '3' },
		{ label: '4 x 4', value: '4' },
		{ label: '5 x 5', value: '5' },
		{ label: '6 x 6', value: '6' },
		{ label: '7 x 7', value: '7' },
		{ label: '8 x 8', value: '8' },
	];
	const typeOptions: Array<any> = ["Normal", "Tournament", "Unrated"];

	function clearForm() {
		formData.value = { mirror: false }
	}

	function sendFormData () {
		emit('searchEvent', formData.value)
	}
	
	function validateIDField(id: string): boolean {
		resetFormValidation();
		if(!id) {
			return true;
		}

		const regLookup = new RegExp("^(\d+)?|(\d+(-\d+)?|\d+(,\d+)*)$")
		const regRestrict = /^[\d,-]+$/;

		if (!regLookup.test(id) || !regRestrict.test(id)) {
			setFormValidation('Invalid ID format (e.g. 123 | 123-456 | 123,456,789)');
			return false;
		}
		// return flase if ending with a hyphen or comma
		if (id.endsWith("-") || id.endsWith(",")) {
			setFormValidation('Cannot end with a hyphen or a comma. (e.g. 123 | 123-456 | 123,456,789)');
			return false;
		}
		// cannot conatin both a hyphen and a comma
		if (id.includes("-") && id.includes(",")) {
			setFormValidation('Cannot contain both a hyphen and a comma. (123-456 | 123,456,789)');
			return false;
		}
		// if value has a hyphen check that the second number is greater than the first
		if (id.includes("-")) {
			const idArray = id.split("-");
			if (parseInt(idArray[0]) >= parseInt(idArray[1])) {
				setFormValidation('Second number must be greater than the first. (e.g. 123-456)');
				return false;
			}
		}
		return true;
	}
	
	function setFormValidation(msg: string) {
		formValidation.value.disable = true;
		formValidation.value.hasError = true;
		formValidation.value.message = msg;
	}
	
	function resetFormValidation() {
		formValidation.value.disable = false;
		formValidation.value.hasError = false;
		formValidation.value.message = '';
	}
</script>

<template>
	<q-dialog v-bind="$attrs">
		<q-card>
			<q-form @submit="sendFormData" @reset="clearForm()">
				<q-card-section class="row justify-between">
					<span class="text-h4">Search</span>
					<div >
						<q-btn flat round icon="close" v-close-popup />
					</div>
				</q-card-section>

				<q-separator />

				<q-card-section style="max-height: 50vh" class="scroll q-pa-none">
					<div class="row justify-between">
						<q-list style="min-width: 15em;" class="col">
							<q-input bottom-slots v-model="formData.id" label="Game ID" type="text" :rules="[(val) => validateIDField(val)]" item-aligned>
								<template v-slot:error>
									Error: {{ formValidation.message }}
								</template>
							</q-input>
							<!-- hint -->
							<q-input v-model="formData.player_white" label="Player White" item-aligned />
							<q-input v-model="formData.player_black" label="Player Black" item-aligned />
						</q-list>
						<q-list style="min-width: 15em;" class="col">
							<q-select v-model="formData.type" :options="typeOptions" label="Game Type" clearable single-line item-aligned />
							<q-select v-model="formData.game_result" :emit-value=true :options="resultOptions" label="Game Result" clearable item-aligned>
								<template v-slot:option="scope">
									<q-item-label header v-if="scope.opt.group" v-bind="scope.itemProps">{{ scope.opt.group }}</q-item-label>
									<q-item v-if="!scope.opt.group" v-bind="scope.itemProps" v-on="scope">
										<q-item-section>
											<q-item-label v-html="scope.opt.label"></q-item-label>
											<q-item-label caption>{{ scope.opt.description }}</q-item-label>
										</q-item-section>
									</q-item>
								</template>
							</q-select>
							<q-select v-model="formData.size" :options="sizeOptions" label="Board Size" map-options clearable single-line item-aligned />
						</q-list>
						<div style="min-width: 15em;" class="col row justify-around q-py-sm q-mx-md">
							<q-toggle v-model="formData.mirror" label="Mirror search" />
						</div>
					</div>
				</q-card-section>

				<q-separator />
				
				<q-card-actions align="right">
					<q-btn flat rounded color="primary" label="Clear" type="reset" />
					<div class="col-grow" />
					<q-btn flat rounded color="primary" label="Cancel" v-close-popup />
					<q-btn rounded color="primary" label="Search" type="submit" v-close-popup :disable="formValidation.disable" />
				</q-card-actions>
			</q-form>
		</q-card>
	</q-dialog>
</template>
