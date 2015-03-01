function comparePositions(arr1, arr2) {
	var count = 0;

	for (var i = 0; i < arr1.length; i++ )
	{
		//console.log ("arr: " + arr + ", count: " + count + ", elem: " + elem);

		if (arr1[i] == arr2[i])
		{
			
			count++;
			
		}
	}
	return count;

}
