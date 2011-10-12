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
    console.log( 'getproxychildren' );
    var org = this;
    var children = undefined;
    // returning empty array for children tends to bollix up tree layout
    if (this.proxyChildren[member.id] && _.keys(this.proxyChildren[member.id]).length) {
      children = _.values( this.proxyChildren[member.id] );
    }
    return children;
  },

  setProxy: function(member, targetMember) { 
    console.log( 'setProxy' );
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

    if (! this.proxyChildren[targetMember.id]) {
      this.proxyChildren[targetMember.id] = {};
    }
    this.proxyChildren[targetMember.id][member.id] = member;
  },

  setUnproxied: function(member) {
    console.log( 'setUnproxied' );
    this.setProxy(member, this.ROOT);
  },

  // lame for now
  getUniqueId: function() {
    return _.keys(this.roster).length + 1;
  },

  // lame for now
  isGoodName: function(name) { 
    return typeof name === 'string' && name !== '';
  },

  createMember: function(name) {
    console.log( 'createMember' );
    if (!this.isGoodName(name)) {
      console.log("bad name: " + name);
      return false;
    }
    var id = this.getUniqueId();
    var member = new Member(this, id, name);
    this.roster[id] = member;
    this.setUnproxied(member);
  }
};

function Member(org, id, name) {
  this.org = org;
  this.id = id;
  this.name = name;
}

Member.prototype = {
  
};

function generateRandomOrg(names, n) {
  var org = new Org();
  nameSlice = _.shuffle(names).slice(0, n);
  _.each(nameSlice, function(name) { 
    org.createMember(name);
  });
  return org;
}


