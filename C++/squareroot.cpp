
#include<bits/stdc++.h>


using namespace std;

    int mySqrt(int n) {
        if(n==0 || n==1){return n;}
        int ans=0;
       int  first=1;
        int last=n;
       while(first<=last){
        int mid=first + (last-first)/2;

        if(mid*mid==n){return mid;}
        else if(mid*mid > n){
            last=mid-1;
        }
        else{
            ans=mid;
            first=mid+1;
        }
       }
    return ans;
    }

int main()
{

	int n;
    cout<<"enter the number";
    cin>>n;
    int ans=mySqrt(n);
   cout<<ans;
  

}

