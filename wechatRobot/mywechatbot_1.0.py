#!/usr/bin/env python
# coding:utf8
import sys
# reload(sys)
# sys.setdefaultencoding( "utf8" )

import itchat
import re
from itchat.content import *


    
# 自动回复文本等类别的群聊消息
# isGroupChat=True表示为群聊消息
@itchat.msg_register([TEXT, SHARING], isGroupChat=True)
def group_reply_text(msg):
	# 消息来自于哪个群聊
	chatroom_id = msg['FromUserName']

	# 消息并不是来自于需要同步的群
	if not chatroom_id in chatroom_ids:
		return

	#print "chatroom_id" + chatroom_id
	# 发送者的昵称
	username = msg['ActualNickName']
	# f = open('msg.txt','w')
	# f.write(str(msg))


	if msg['Type'] == TEXT:
		content = msg['Content']
		#print 1
	elif msg['Type'] == SHARING:
		content = msg['Text']
		#print 2

	print(msg['Text'])
	print(getPhone(msg['Text']))
	print(getType(msg['Text']))
	print(getTime(msg['Text']))
	print(getTime(msg['ActualNickName']))
	print(msg['Url'])


def getPhone(text):
	regex= re.compile(r'1\d{10}',re.IGNORECASE)
	phonenums= re.findall(regex,text)
	if len(phonenums) >= 1:
		print(phonenums[0])
		return phonenums[0]


def getTime(text):
	regex= re.compile(r'(\d{1,2}(:|\.)\d{1,2})',re.IGNORECASE)
	time= re.findall(regex,text)
	if len(time) >= 1:
		print(time[0][0])
		return time[0][0]

	regex= re.compile(r'\d{1,2}点\d{0,2}',re.IGNORECASE)
	time= re.findall(regex,text)
	if len(time) >= 1:
		print(time[0])
		return time[0]

def getType(text):

	result = -1
	regex1= re.compile(r'回宫|去宫|潞城发车|潞城回',re.IGNORECASE)
	type1= re.findall(regex1,text)
	regex2= re.compile(r'去潞城',re.IGNORECASE)
	type2= re.findall(regex2,text)

	if len(type1) >= 1:
		result=1;
	elif len(type2) >= 1:
		result=2;
	
	print(result)
	return result



# 扫二维码登录
#itchat.auto_login(hotReload=False)
itchat.auto_login(hotReload=True)
# 获取所有通讯录中的群聊
# 需要在微信中将需要同步的群聊都保存至通讯录
chatrooms = itchat.get_chatrooms(update=True, contactOnly=True)
chatroom_ids = [c['UserName'] for c in chatrooms]
#chatroom_rename={}
print('正在监测的群聊：', len(chatrooms), '个')
# 开始监测
itchat.run()