export default function generateRoomID (length: number = 4) {
    let id: string = ''
	const random = () => Math.floor(Math.random() * chars.length)
	const chars: string[] = (() => {
		let ary: string[] = [];

		for (let i = 0; i <= 9; i++)
			ary.push(i.toString());

		for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++)
			ary.push(String.fromCharCode(i));

		return ary;
	})();

	for (let i = 0; i < length; i++) {
		id += chars[random()]
	}

	return id;
}