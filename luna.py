import time

# makes unbound methods act like class methods
class Callable:
    	def __init__(self, anycallable):
        	self.__call__ = anycallable

class Util:
	def removeFromList(x, item):
		i = 0
		while i < len(x):
			if x[i] is item:
				del x[i]
			else:
				i += 1
	removeFromList = Callable(removeFromList)


class Org:
	def __init__(self, name):
		self.name = name
		self.membership = Membership()
		self.unproxiedUsers = []

	def addUser(self, time, user):
		self.membership.join(time, user)
		self.addToUnproxiedUsers(user)

	def removeUser(self, time, user):
		for proxiedUser in user.proxyChildren:
			# XXX notify
			proxiedUser.removeProxy()
		self.membership.leave(time, user)
		self.removeFromUnproxiedUsers(user)

	def removeFromUnproxiedUsers(self, user):
		Util.removeFromList(self.unproxiedUsers, user)

	def addToUnproxiedUsers(self, user):
		self.unproxiedUsers.append(user)

	def getUnproxiedUsers(self):
		return self.unproxiedUsers
		
	def printTree(self, indent=0 ):
		for user in self.unproxiedUsers:
			user.debugSubtree()


class Membership:
	def __init__(self):
		self.roster = {};

	def isOrWasMember(self, user):
		return self.roster.has_key(user.id) 

	def isMember(self, time, user):
		isMember = False
		if self.roster.has_key(user.id):
			for event in self.roster[user.id]:
				eventTime, eventType = event
				if eventTime > time:
					break
				if eventType == 'begin':
					isMember = True
				elif eventType == 'end':
					isMember = False
				else:
					throw (Error,e)
		return isMember			

	def join(self, time, user):
		if not self.isMember(time, user):
			if not self.roster.has_key(user.id):
				self.roster[user.id] = []	
			history = self.roster[user.id]
			history.append((time, 'begin'))
			# sort history by time before serializing		
	
	# throw error is not currently a member?
	def leave(self, time, user):
		if self.isMember(time, user):
			history = self.roster[user.id]
			history.append((time, 'end'))
			# sort roster by time before serializing		


class User:
	maxId = None

	def __init__(self, time, name, org):
		self.org = org
		self.id = self.incrementId()
		self.name = name
		self.weight = 1
		self.proxy = None
		self.proxyChildren = []
		self.votes = {} 
		org.addUser(time, self)

	def incrementId(self):
		if self.maxId is None: 
			self.maxId = 1
		else:
			self.maxId += 1
		return self.maxId

	def makeProxy(self, user):
		org.removeFromUnproxiedUsers(self)
		self.proxy = user
		user.addProxyChild(self)

	def removeProxy(self):
		if self.proxy:
			self.proxy.removeProxyChild(self)
			self.proxy = None;
			self.org.addToUnproxiedUsers(self)

	def addProxyChild(self, user):
		if user not in self.proxyChildren:
			self.proxyChildren.append(user)

	def removeProxyChild(self, user):
		Util.removeFromList(self.proxyChildren, user)
			
	def vote(self, question, option):
		self.votes[question] = option

	# error cond if currently proxied?
	def getVote(self, question):
		vote = None
		if self.votes.has_key(question):
			vote = self.votes[question]
		return vote

	# this will benefit from caching -- a change of proxy should simply invalidate cache
	# or, perhaps we will actually communicate weight upwards instantly... who knows
	def getWeight(self):
		weight = self.weight
		for child in self.proxyChildren:
			weight += child.getWeight()
		return weight
			
		
	def debugSubtree(self, indent=0 ):
		print (' ' * indent) + self.name	
		for user in self.proxyChildren:
			user.debugSubtree(indent + 1)
 


class Question:
	def __init__(self,  org, text, options ):
		self.org = org
		self.text = text
		self.options = options

	def decide(self):
		tally = Tally(self)
		for user in self.org.getUnproxiedUsers():
			weight = user.getWeight()
			vote = user.getVote(self)
			# is the decision in the available options for this question
			tally.add(weight, vote)
		winners = tally.getWinners()
		if len(winners) == 0:
			print "No winner?"
		elif len(winners) > 1:
			print 'Tie! ' + ', '.join( winners )
		elif len(winners) == 1:
			print 'Winner! ' + winners[0]
		else:
			# impossible?
			print "Unknown result?!"			


class Tally:
	unknownDecision = '?'

	def __init__(self, question):
		self.counts = {}
		self.counts[self.unknownDecision] = 0;
		for option in question.options:
			self.counts[option] = 0;
		
	
	def add(self, weight, vote):
		if vote in self.counts:
			voteToCount = vote
		else:
			voteToCount = self.unknownDecision

		self.counts[voteToCount] += weight


	def getWinners(self):
		max = 0
 		winners = []
		for option in self.counts.keys():
			print option + ':' + str(self.counts[option])
			if self.counts[option] > max:
				winners = [option]
				max = self.counts[option]
			elif self.counts[option] == max:
				winners.append(option)
		return winners
			
	
if __name__ == '__main__': 
	time = time.time()
	org = Org('ardent heavy industries')
	nicole = User(time, 'nicole', org)
	ian = User(time, 'ian', org)
	burstein = User(time, 'burstein', org)
	ed = User(time, 'ed', org)
	heather = User(time, 'heather', org)
	alice = User(time, 'alice', org)
	
	lunch = Question(org, 'lunch', [ 'thai', 'innout', 'pizza' ])

	burstein.vote( lunch, 'thai' )
	ian.vote( lunch, 'thai' )
	nicole.vote( lunch, 'pizza' )
	ed.makeProxy(nicole)
	heather.makeProxy(nicole)
	heather.removeProxy()
	alice.makeProxy(ed)
	# org.removeUser(time, nicole)
	ed.vote(lunch, 'innout')

	print "organization tree:"
	print "=================="
	org.printTree()	
	
	print

	print "decision:"	
	print "=================="
	lunch.decide()
	
