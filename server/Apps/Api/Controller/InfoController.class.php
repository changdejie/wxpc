<?php
namespace Api\Controller;
use Think\Controller;
class InfoController extends Controller {
	
	//添加拼车信息
	public function add(){
		$u = D('User');
		$user = $u->getUserInfo(vaild_sk(I('sk')));
		$data = $_POST;
		$data['uid'] = $user['id'];
		$i = D('Info');
		if (!($id=($i->addInfo($data)))){
			$result['status'] = 0;
			$result['msg'] = $i->getError();
		}else{
			$result['status'] = 1;
			$result['msg'] = '发布成功';
			$result['info'] = $id;
			
			if($user['vehicle'] == ''){
				$u->vehicle = $data['vehicle'];
			}	
			if($user['phone'] == ''){
				$u->phone = $data['phone'];
			}
			if($user['name'] == ''){
				$u->name = $data['name'];
			}		
			$u->save();	
		}
		exit(json_encode($result));
	}
	
	public function index(){
		$i = D('Info');
		$data = $i->getInfo(I('id'));
		//dump($i->getLastSql());
		if(empty($data)){
			$result['status'] = 0;
			$result['msg'] = '没有找到该信息';
		}else{
			$result['status'] = 1;
			$result['msg'] = '获取成功';
			$result['data'] = $data;		
		}
		exit(json_encode($result));
	}
	
	
	public function lists(){
		$i = D('Info');
		\Think\Log::record('测试日志信息，这是警告级别','WARN');
		$start = I('start','');
		$over = I('over','');
		$isAllTypesValues = I('isAllTypesValues','');
		$isAllTypes = I('isAllTypes','');
		$date = I('date','');
		$where = 'info.status = 1 and info.time >= "'.time().'"';
		
		if($date != ''){
			$where .= ' and info.date between "'.$date.'" and "'.$date.'"';
		}
		
		if($start == '潞城'){
			$where .= ' and  info.departure = '."'".$start."'".' and  (( info.isAllTypes = 1) or (info.isAllTypes=2  and info.isAllTypesValues not like '.'"%'.$over.'%" '.' or (info.isAllTypes=3 and info.isAllTypesValues  like '.'"%'.$over.'%"'.'))) ' ;
		}
		
		if($over == '潞城'){
			$where .= ' and info.destination like "%'.$over.'%"'.' and  (( info.isAllTypes = 1) or (info.isAllTypes=2  and info.isAllTypesValues not like '.'"%'.$start.'%" '.' or (info.isAllTypes=3 and info.isAllTypesValues  like '.'"%'.$start.'%"'.'))) ' ;
		}
		$page = I('page','1');
		$page_count = 20;
		$limit = ($page-1)*$page_count;
		trace('tag',$where,'INFO',true);
		
		$list = $i->table('__INFO__ info')->field('info.*,user.avatarUrl')->join('__USER__ user ON user.id = info.uid','LEFT')->where($where)->limit($limit,$page_count)->order('time asc')->select();
		//dump($i->getLastSql());
		$result['status'] = 1;
		$result['msg'] = '获取成功';
		$result['list'] = $list;
		exit(json_encode($result));
	}
	
	
	public function mycount(){
		$u = D('User');
		$user = $u->getUserInfo(vaild_sk(I('sk')));
		$i = D('Info');
		$where['uid'] = $user['id'];
		$where['status'] = 1;
		$data = $i->where($where)->count();
		$result['status'] = 1;
		$result['msg'] = '获取成功';
		$result['data'] = $data;
		exit(json_encode($result));
	}
	public function mylist(){
		$u = D('User');
		$user = $u->getUserInfo(vaild_sk(I('sk')));
		$i = D('Info');
		$where['uid'] = $user['id'];
		$where['status'] = 1;
		$page = I('page','1');
		$page_count = 20;
		$limit = ($page-1)*$page_count;
		$data = $i->where($where)->limit($limit,$page_count)->order('id desc')->select();
		$result['status'] = 1;
		$result['msg'] = '获取成功';
		$result['data'] = $data;
		exit(json_encode($result));
	}
	
	public function del(){
		$u = D('User');
		$i = D('Info');
		$user = $u->getUserInfo(vaild_sk(I('sk')));
		$where['uid'] = $user['id'];
		$where['id'] = I('id');
		if($i->where($where)->delete() > 0){
			$a = D('Appointment');
			$newwhere['iid'] = I('id');
			$a->where($newwhere)->delete();
			$result['status'] = 1;
			$result['msg'] = '删除成功';
		}else{
			$result['status'] = 0;
			$result['msg'] = '删除失败';
		}
		exit(json_encode($result));
	}

        public function disabled(){
                $u = M('Info');
                $data['status'] = 0;
                $id = I('id');
                if($u->where('id='.$id)->save($data) > 0){
                        $result['status'] = 1;
                        $result['msg'] = '操作成功';
                }else{
                        $result['status'] = 0;
                        $result['msg'] = '操作失败';
                }
                exit(json_encode($result));
        }

}
