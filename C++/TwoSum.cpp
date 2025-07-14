
#include<bits/stdc++.h>
using namespace std;
void twoSum(vector<int>& nums, int target) {
    vector<int>ans;
    for(int i=0;i<nums.size();i++)
    {
        for(int j=i+1;j<nums.size();j++)
        {
          if(nums[i]+nums[j]==target)
          {
              ans.push_back(i);
              ans.push_back(j);
          }
        }
    } 
    for(int i=0;i<ans.size();i++){
        cout<<ans[i];
    }   
}
int main()
{
	vector<int>num={2,4,3};
    int target=6;
    twoSum(num,target);
    return 0;
}