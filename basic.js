/******* SETTINGS ********/

//Main buffer
var Buffer = [];

//Format of task number
//Values: both, countalone
//both 			= 2/5
//countalone 	= 2
var TaskNumberFormat = "both"

$( document ).ready(function() {
	
	//add from html
	BufferAdd($('.taskcontainer').html(), GetGroupId());
	
	MakeGroupList();
	
	UpdateGroupCount();
	
	
	/*
	* New Task from Click
	*/
	$('body').on("click", "#new_task_sub", function(out) {
		out.preventDefault();
		var NewTaskName = $('#new_task_nm').val();
		
		if(NewTaskName.length > 0) {
			var TaskHTML = BuildNewTask(NewTaskName);
			AddToTaskC(TaskHTML);
		}
		else ErrorMSG('Task is empty.');
	});
	
	/*
	* New group
	*/
	$('body').on("click", "#new_group_sub", function(out) {
		out.preventDefault();
		var NewGroupName = $('#new_group_nm').val();
		
		if(NewGroupName.length > 0) {
			NewGroup(NewGroupName);
		}
		else ErrorMSG('Group is empty.');
	});
	
	$('body').on("click", ".check", function(out) {
		//out.preventDefault();
		TaskID = this.closest('.task').id;
		
		FlipFlopStatus(TaskID);
	});
	
	/*
	* Group select event
	*/
	var previousopt = $( "#groupselect option:selected" ).text();
	var firstclick_group = 0;
	
	$('body').on("click", "#groupselect", function(me) {
		me.preventDefault();
		var grpselval = $( "#groupselect option:selected" ).val();
		
		if(firstclick_group != 0) {
			
			//prevent sending same value
			//and switch
			if(grpselval != previousopt) {
				
				var TargetIndex = BufferIs(grpselval);
				
				$('.taskcontainer').html(Buffer[TargetIndex]);
			}
		}
		
		firstclick_group++;
		previousopt = grpselval;
	});
	
	
	/*
	* Download event
	*/
	$('body').on("click", "#download_buff", function(me) {
		me.preventDefault();
		
		var DownloadData = JSON.stringify(Buffer); 
		var filename = "tasks.buffer";
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(DownloadData));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
		
	});
	
	
 // preventing page from redirecting
 $("html").on("dragover", function(e) {
    e.preventDefault();
    e.stopPropagation();
 });

 $("html").on("drop", function(e) { e.preventDefault(); e.stopPropagation(); });
	
	
	$('body').on("drop", "#drop-area", function(event) {
		event.preventDefault();
		var files = event.target.files
		
			
		var file = event.originalEvent.dataTransfer.files[0],
		reader = new FileReader();
		reader.onload = function (event) {
			var FileContents = event.target.result;
			
			setTimeout(function(){
				callback(FileContents);

			}, 0); 
		};

		reader.readAsText(file);
	});

  
});


function callback (FileContents) {
	if(typeof FileContents !== 'undefined') {
		Buffer = JSON.parse(FileContents);
		$('.taskcontainer').html(Buffer[0]);
		RefreshGroupList();
	}
}

/****** Task *******/

function BuildNewTask (TaskText) {
	var TaskID = makeid(32);
	return "<div class=\"task\" id=\"" + TaskID + "\"><div class=\"task-inside\"><input type=\"checkbox\" class=\"check\"><div class=\"count\"></div><div class=\"tasktext\">" + TaskText + "</div></div><div class=\"stripe\"></div></div>";
}

function clearTaskInput () {
	$('#new_task_nm ').val('');
}

function AddToTaskC (html) {
	
	$('.taskcontainer').append('\n' + html);
	clearTaskInput();
	UpdateGroupCount();
	
	//update buffer
	UpdateSaveData();
}

function RemoveFTaskC (TaskID) {
	var Task = $('.task#'+ TaskID);
	Task.remove();
	UpdateGroupCount();
}

/****** Groups ******/

function UpdateGroupCount () {
	
	var GroupMax = GetGroupCount();
	var count = 0;
	
	$(".taskcontainer > .task").each(function() {
		count++;
		var Target = $(this).find('.count');
		if(TaskNumberFormat == "both") Target.text(count + '/' + GroupMax);
		else if(TaskNumberFormat == "countalone") Target.text(count);
	});
}

function GetGroupCount () {
	return $('.taskcontainer').children('.task').length;
}

function ListGroups () {
	var ListB = [];
	
	
	var BfCount = Buffer.length;
	
	if(BfCount > 0) {
		
		for(let i = 0; i < BfCount; i++) 
		{
			
			var Val = Buffer[i];
			
			var Mid = $("<div>", {html: Val});
			
			var Stuff = Mid.find('.sub-group');
			
			var GroupID = Stuff.text();

			ListB.push(GroupID);
		}

		return ListB;
	}
	
	return false;
}

function GetGroupName () {
	return $('.sub-group').text();
}

function MakeGroupList () {
	
	let List = ListGroups();
	var GroupNow = GetGroupName();
	
	for(let i = 0; i < List.length; i++) 
	{
		//selected
		if(GroupNow == List[i]) {
			$('#groupselect').append($('<option>', {
				value: List[i],
				text: List[i],
				selected: 'selected'
			}));
		}
		//not selected
		else {
			$('#groupselect').append($('<option>', {
				value: List[i],
				text: List[i]
			}));
		}
	}
	
}

function RefreshGroupList () {
	$('#groupselect').empty();
	MakeGroupList();
}

function NewGroup (GroupName) {
	var Header = MakeGroupHeader(GroupName);
	
	$('.taskcontainer').html(Header);
	
	BufferAdd(Header, GetGroupId());
	
	RefreshGroupList();
}

function DeleteGroup (GroupID) {
	
	
}

function UpdateSaveData () {
	
	var GroupID = GetGroupId();
	
	BufferReplace(GroupID, $('.taskcontainer').html());
}

function GetGroupId () {
	return $('.sub-group').attr('id');
}


function MakeGroupHeader (GroupName) {
	var GroupID = makeid(32);
	return "<div class=\"stripe\"></div><div class=\"sub-group text-center\" id=\"" + GroupID + "\">" + GroupName + "</div><div class=\"stripe\"></div>";
}

function ChangeGroup (GroupID) {
	var NewContent = "";
	$('.taskcontainer').html(NewContent);
}


/***** Buffer ******/

function BufferIs (GroupID) {
	
	for (var j=0; j<Buffer.length; j++) {
        if (Buffer[j].match(GroupID)) return j;
    }
	
	return false;
}

function BufferGet (GroupID) {
	var number = BufferIs(GroupID);
	if(number === false) return false;
	return Buffer[number];
}

function BufferAdd (Data, GroupID) {
	var res = BufferIs(GroupID);
	if(res === false) {
		Buffer.push(Data);
	}
}

function BufferReplace (GroupID, Data) {
	var index = BufferIs(GroupID);
	
	if(index === false) return false;
	
	Buffer[index] = Data;
	
	return true;
}

function BufferRemove (GroupID) {
	var index = BufferIs(GroupID);
	
	if(index === false) return false;
	
	array.splice(index, 1);
}

/*
* Toggle status of task
*/
function FlipFlopStatus (TaskID) {
	
	var Task = $('.task#'+ TaskID);
	var Checkbox = Task.find('.check');
	var Count = Task.find('.count');
	var ChckStatus = Checkbox.is(':checked');
	
	//checkbox is on
	if(ChckStatus) {
		StyleActionOn(Task);
		StyleActionOn(Count);
		Checkbox.attr('checked',true);
	}
	//checkbox is off
	else {
		StyleActionOff(Task);
		StyleActionOff(Count);
		Checkbox.attr('checked',false);
	}
	
	//update buffer
	UpdateSaveData();
}

function StyleActionOn (who) {
	who.css('text-decoration', 'line-through');
	who.css('font-weight', 'bold');
}

function StyleActionOff (who) {
	who.css('text-decoration', 'none');
	who.css('font-weight', 'normal');
}

/******* Misc ********/

function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function ErrorMSG (text) {
	$('.errormessages').text(text);
	$('.errormessages').html(text).fadeIn().delay(3000).fadeOut();
}





