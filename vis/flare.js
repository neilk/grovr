function showLog(s) {
  console.log(s);
  var logElt = document.getElementById('log');
  logElt.appendChild( document.createTextNode(s) );
  logElt.appendChild( document.createElement( 'br' ) );
}

window.names = [
"Jacob",
"Ethan",
"Michael",
"Jayden",
"William",
"Alexander",
"Noah",
"Daniel",
"Aiden",
"Anthony",
"Joshua",
"Mason",
"Christopher",
"Andrew",
"David",
"Matthew",
"Logan",
"Elijah",
"James",
"Joseph",
"Gabriel",
"Benjamin",
"Ryan",
"Samuel",
"Jackson",
"John",
"Nathan",
"Jonathan",
"Christian",
"Liam",
"Dylan",
"Landon",
"Caleb",
"Tyler",
"Lucas",
"Evan",
"Gavin",
"Nicholas",
"Isaac",
"Brayden",
"Luke",
"Angel",
"Brandon",
"Jack",
"Isaiah",
"Jordan",
"Owen",
"Carter",
"Connor",
"Justin",
"Jose",
"Jeremiah",
"Julian",
"Robert",
"Aaron",
"Adrian",
"Wyatt",
"Kevin",
"Hunter",
"Cameron",
"Zachary",
"Thomas",
"Charles",
"Austin",
"Eli",
"Chase",
"Henry",
"Sebastian",
"Jason",
"Levi",
"Xavier",
"Ian",
"Colton",
"Dominic",
"Juan",
"Cooper",
"Josiah",
"Luis",
"Ayden",
"Carson",
"Adam",
"Nathaniel",
"Brody",
"Tristan",
"Diego",
"Parker",
"Blake",
"Oliver",
"Cole",
"Carlos",
"Jaden",
"Jesus",
"Alex",
"Aidan",
"Eric",
"Hayden",
"Bryan",
"Max",
"Jaxon",
"Brian",
"Isabella",
"Sophia",
"Emma",
"Olivia",
"Ava",
"Emily",
"Abigail",
"Madison",
"Chloe",
"Mia",
"Addison",
"Elizabeth",
"Ella",
"Natalie",
"Samantha",
"Alexis",
"Lily",
"Grace",
"Hailey",
"Alyssa",
"Lillian",
"Hannah",
"Avery",
"Leah",
"Nevaeh",
"Sofia",
"Ashley",
"Anna",
"Brianna",
"Sarah",
"Zoe",
"Victoria",
"Gabriella",
"Brooklyn",
"Kaylee",
"Taylor",
"Layla",
"Allison",
"Evelyn",
"Riley",
"Amelia",
"Khloe",
"Makayla",
"Aubrey",
"Charlotte",
"Savannah",
"Zoey",
"Bella",
"Kayla",
"Alexa",
"Peyton",
"Audrey",
"Claire",
"Arianna",
"Julia",
"Aaliyah",
"Kylie",
"Lauren",
"Sophie",
"Sydney",
"Camila",
"Jasmine",
"Morgan",
"Alexandra",
"Jocelyn",
"Gianna",
"Maya",
"Kimberly",
"Mackenzie",
"Katherine",
"Destiny",
"Brooke",
"Trinity",
"Faith",
"Lucy",
"Madelyn",
"Madeline",
"Bailey",
"Payton",
"Andrea",
"Autumn",
"Melanie",
"Ariana",
"Serenity",
"Stella",
"Maria",
"Molly",
"Caroline",
"Genesis",
"Kaitlyn",
"Eva",
"Jessica",
"Angelina",
"Valeria",
"Gabrielle",
"Naomi",
"Mariah",
"Natalia",
"Paige",
"Rachel"
];

function Org() {
  this.ROOT = new Member(this, 0, 'ROOT'); // pseudo-member
  this.roster = {};
  this.proxyParent = {};
  this.proxyChildren = {};
  this.questions = [];
}

Org.prototype = {

  getRoot: function() { 
    return this.ROOT;
  },
  
  removeMember: function(member) {
    this.setUnproxied(member);
    // if we had any proxyChildren, release them to be unproxied
    var org = this;
    _.each(this.getProxyChildren(member.id), function(member) { 
      org.setUnproxied(member);
    });
    delete this.roster[member.id];
  },

  getProxyChildren: function(member) {
    var org = this;
    var children = undefined;
    // returning empty array for children tends to bollix up tree layout
    if (this.proxyChildren[member.id] && _.keys(this.proxyChildren[member.id]).length) {
      children = _.values( this.proxyChildren[member.id] );
    }
    return children;
  },

  setProxy: function(member, targetMember) { 
    // remove it from its proxyparent
    var currentParentNodeId = this.proxyParent[member.id];
    // every member should have a current parent node, unless just created
    if ( currentParentNodeId !== undefined ) {
      if ( this.proxyChildren[currentParentNodeId] ) {
        var currentParentsChildren = this.proxyChildren[currentParentNodeId];
        delete currentParentsChildren[member.id];
      }
    }

    this.proxyParent[member.id] = targetMember.id;
    if ( targetMember.id !== 0 ) {
	    showLog( 'member ' + member.show() + ' proxied to ' + targetMember.show() );
    }

    if (! this.proxyChildren[targetMember.id]) {
      this.proxyChildren[targetMember.id] = {};
    }
    this.proxyChildren[targetMember.id][member.id] = member;
  },

  setUnproxied: function(member) {
    this.setProxy(member, this.ROOT);
  },

  
  // lame for now
  isGoodName: function(name) { 
    return typeof name === 'string' && name !== '';
  },

  createMember: function(name) {
    if (!this.isGoodName(name)) {
      showLog("bad name: " + name);
      throw 'bad name!';
    }
    var id = getUniqueId();
    var member = new Member(this, id, name);
    this.roster[id] = member;
    this.setUnproxied(member);
  },

  addQuestion: function(question) {
    this.questions.push(question);
  }
};

function Member(org, id, name) {
  this.org = org;
  this.id = id;
  this.name = name;
  this.votes = {};
}

Member.prototype = {
  vote: function( question, option ) {
    if ( !question.hasOption( option ) ) {
      throw 'That question does not have that option';
    }
    if (! this.votes[question.id] ) {
      this.votes[question.id] = [];
    }
    this.votes[question.id].push(option);
  },

  getVote: function(question) {
    if (this.votes[question.id]) {
      var votes = this.votes[question.id];
      var lastVote = votes[votes.length - 1];
      showLog( "member " + this.show() + " did vote: " + lastVote.description );
      return lastVote;
    } else {
      showLog( "member " + this.show() + " did not vote " );
      return null;
    }
  },

  getEffectiveVote: function(question) {
    var root = this.org.getRoot();
    if ( this === root ) {
      return null;
    } else {
      var parentId = this.org.proxyParent[this.id];
      var parent;
      if ( parentId === 0 ) { 
        parent = root;
      } else {
        parent = this.org.roster[ parentId.toString() ];
      }
      if ( parent === undefined ) {
        debugger;
      } 
      if ( parent === root ) {
        // my vote is my vote, if I have one 
        return this.getVote(question);
      } else {
        // my vote is my parent's vote (not counting root)
        return parent.getEffectiveVote(question);
      }
    }
  },

  show: function() {
    return this.name + ' (#' + this.id + ')';
  }

};

function generateRandomOrg(names, n) {
  var org = new Org();
  nameSlice = _.shuffle(names).slice(0, n);
  _.each(nameSlice, function(name) { 
    org.createMember(name);
  });
  return org;
}

function Question( description, options) {
  this.description = description;
  this.options = [];
  this.id = getUniqueId();
  var question = this;
  
  _.each( options, function( optDesc ) {
    question.options.push( new Option( optDesc ) );
  } );
}

Question.prototype = {
  hasOption: function(option) {
    return _.contains( this.options, option );
  }
};

function Option(description) {
  this.id = getUniqueId();
  this.description = description;
}

// lame for now
var getUniqueId = ( function(count) {
  return function() {
    count++;  // two lines just to pass lint
    return count;
  };
} )(0);

